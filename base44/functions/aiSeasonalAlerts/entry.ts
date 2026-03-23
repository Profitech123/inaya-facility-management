import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Admin-only scheduled function: sends seasonal maintenance alerts to customers
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both admin calls and scheduled automation (no user in that case)
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch {
      // Called from automation — proceed
      isAdmin = true;
    }

    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { dry_run = false } = await req.json().catch(() => ({}));

    console.log(`Running seasonal alerts (dry_run=${dry_run})`);

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    // Determine seasonal context for Dubai
    const seasonalContext = month >= 4 && month <= 9
      ? { season: 'Summer', focus: 'AC maintenance is critical. Dubai temperatures exceed 45°C. Also pool care and pest control.', urgent_services: ['AC Maintenance', 'Pool Maintenance', 'Pest Control'] }
      : { season: 'Winter/Mild', focus: 'Deep cleaning season. Good time for landscaping, painting, and structural checks.', urgent_services: ['Deep Cleaning', 'Landscaping', 'Civil Maintenance'] };

    const [customers, bookings, subscriptions, services] = await Promise.all([
      base44.asServiceRole.entities.User.list().then(all => all.filter(u => u.role === 'user' && u.email)),
      base44.asServiceRole.entities.Booking.filter({ status: 'completed' }),
      base44.asServiceRole.entities.Subscription.filter({ status: 'active' }),
      base44.asServiceRole.entities.Service.list(),
    ]);

    let notified = 0;
    const results = [];

    for (const customer of customers.slice(0, 50)) { // Process up to 50 customers
      const customerBookings = bookings.filter(b => b.customer_id === customer.id);
      const hasActiveSub = subscriptions.some(s => s.customer_id === customer.id);

      // Check which urgent services haven't been done recently (90 days)
      const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
      const recentServices = customerBookings
        .filter(b => new Date(b.scheduled_date) > ninetyDaysAgo)
        .map(b => services.find(s => s.id === b.service_id)?.name)
        .filter(Boolean);

      const overdueServices = seasonalContext.urgent_services.filter(
        svcName => !recentServices.some(rs => rs.toLowerCase().includes(svcName.toLowerCase().split(' ')[0]))
      );

      if (overdueServices.length === 0) continue; // Customer is up to date

      const message = `${seasonalContext.season} alert: Your ${overdueServices.join(', ')} ${overdueServices.length === 1 ? 'is' : 'are'} due. ${hasActiveSub ? 'Book via your subscription.' : 'Book now on the INAYA app.'}`;

      results.push({ customer: customer.email, overdue: overdueServices, message });

      if (!dry_run) {
        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_id: customer.id,
          type: 'general',
          title: `🌡️ ${seasonalContext.season} Maintenance Alert`,
          message,
          link_page: 'OnDemandServices',
        });

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `INAYA: ${seasonalContext.season} Maintenance Reminder`,
          body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#059669,#047857);color:white;padding:25px;text-align:center;border-radius:8px 8px 0 0">
    <h2 style="margin:0">🌡️ ${seasonalContext.season} Maintenance Alert</h2>
    <p style="margin:5px 0 0;opacity:.85">Property Care Reminder from INAYA</p>
  </div>
  <div style="background:#f9fafb;padding:25px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <p>Hi ${customer.full_name || 'Valued Customer'},</p>
    <p>${seasonalContext.focus}</p>
    <p>Based on your service history, the following services may be due:</p>
    <ul>${overdueServices.map(s => `<li><strong>${s}</strong></li>`).join('')}</ul>
    <p style="text-align:center;margin:20px 0">
      <a href="https://inaya.ae/OnDemandServices" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Book Now</a>
    </p>
    <p style="font-size:13px;color:#6b7280;text-align:center">Questions? Call +971 4 815 7300 | info@inaya.ae</p>
  </div>
</div>`,
          from_name: 'INAYA Maintenance Reminders'
        });
        notified++;
      }
    }

    console.log(`Seasonal alerts: ${notified} notifications sent, ${results.length} customers with overdue services`);
    return Response.json({ success: true, notified, dry_run, season: seasonalContext.season, results });
  } catch (error) {
    console.error('aiSeasonalAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});