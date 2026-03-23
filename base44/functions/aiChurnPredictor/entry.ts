import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Admin-only: finds at-risk customers and sends win-back emails
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch { isAdmin = true; }

    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { dry_run = false } = await req.json().catch(() => ({}));

    console.log(`Running churn prediction (dry_run=${dry_run})`);

    const now = new Date();
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [customers, bookings, subscriptions] = await Promise.all([
      base44.asServiceRole.entities.User.list().then(all => all.filter(u => u.role === 'user' && u.email)),
      base44.asServiceRole.entities.Booking.list('-scheduled_date', 500),
      base44.asServiceRole.entities.Subscription.list(),
    ]);

    const atRiskCustomers = [];

    for (const customer of customers) {
      const customerBookings = bookings.filter(b => b.customer_id === customer.id);
      if (customerBookings.length === 0) continue; // Never booked, skip

      const recentBookings = customerBookings.filter(b => new Date(b.scheduled_date) > ninetyDaysAgo);
      const activeSubscription = subscriptions.find(s => s.customer_id === customer.id && s.status === 'active');

      // Churn signals
      const dormant = recentBookings.length === 0; // No booking in 90 days
      const expiringSoon = activeSubscription && new Date(activeSubscription.end_date) < thirtyDaysFromNow;
      const cancelledSub = subscriptions.some(s => s.customer_id === customer.id && s.status === 'cancelled');

      if (!dormant && !expiringSoon && !cancelledSub) continue;

      const reasons = [];
      if (dormant) reasons.push(`No booking in 90+ days (last: ${customerBookings[0]?.scheduled_date || 'unknown'})`);
      if (expiringSoon) reasons.push(`Subscription expiring: ${activeSubscription.end_date}`);
      if (cancelledSub) reasons.push('Previously cancelled subscription');

      atRiskCustomers.push({ customer, reasons, dormant, expiringSoon, cancelledSub, totalBookings: customerBookings.length });
    }

    console.log(`Found ${atRiskCustomers.length} at-risk customers`);

    let contacted = 0;
    const results = [];

    for (const { customer, reasons, totalBookings } of atRiskCustomers.slice(0, 30)) {
      // Generate personalized win-back message with AI
      const aiEmail = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a warm, personalized win-back email body (HTML, no subject) for an INAYA customer who may be churning.

Customer: ${customer.full_name || 'Valued Customer'}
Reason for outreach: ${reasons.join('; ')}
Total past bookings: ${totalBookings}
Current month: ${now.toLocaleString('en', { month: 'long' })}

Include:
- Warm, non-pushy tone
- Acknowledge they haven't been in touch
- Offer a 10% discount code: COMEBACK10
- Highlight 1-2 seasonal services relevant to Dubai
- CTA to book

Keep it under 150 words. Professional but human.`
      });

      results.push({ customer: customer.email, reasons });

      if (!dry_run) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: customer.id,
          type: 'general',
          title: 'We miss you! Special offer inside',
          message: 'Use code COMEBACK10 for 10% off your next service. Book now.',
          link_page: 'OnDemandServices',
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `${customer.full_name?.split(' ')[0] || 'Hi'}, we miss you — 10% off your next service`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#059669,#047857);color:white;padding:25px;text-align:center;border-radius:8px 8px 0 0">
    <h2 style="margin:0">We Miss You! 💚</h2>
    <p style="margin:5px 0 0;opacity:.85">INAYA Facilities Management</p>
  </div>
  <div style="background:#f9fafb;padding:25px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    ${aiEmail}
    <div style="background:#f0fdf4;padding:15px;border-radius:8px;text-align:center;margin:20px 0;border:2px dashed #059669">
      <div style="font-size:13px;color:#6b7280;margin-bottom:5px">Your exclusive discount code</div>
      <div style="font-size:24px;font-weight:bold;color:#059669;letter-spacing:4px">COMEBACK10</div>
      <div style="font-size:12px;color:#6b7280;margin-top:5px">10% off your next booking</div>
    </div>
    <p style="text-align:center">
      <a href="https://inaya.ae/OnDemandServices" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Book Now</a>
    </p>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:15px">+971 4 815 7300 | info@inaya.ae</p>
  </div>
</div>`,
          from_name: 'INAYA Customer Care'
        });
        contacted++;
      }
    }

    return Response.json({ success: true, at_risk_count: atRiskCustomers.length, contacted, dry_run, results });
  } catch (error) {
    console.error('aiChurnPredictor error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});