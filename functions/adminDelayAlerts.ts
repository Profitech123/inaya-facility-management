import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toISOString().split('T')[0];

    // Get today's bookings that are problematic
    const allBookings = await base44.asServiceRole.entities.Booking.filter({ scheduled_date: today });
    
    const [providers, services, properties, users] = await Promise.all([
      base44.asServiceRole.entities.Provider.list(),
      base44.asServiceRole.entities.Service.list(),
      base44.asServiceRole.entities.Property.list(),
      base44.asServiceRole.entities.User.list(),
    ]);

    const admins = users.filter(u => u.role === 'admin' && u.email);

    if (admins.length === 0) {
      console.log('No admin users found');
      return Response.json({ success: true, alerts_sent: 0, reason: 'no_admins' });
    }

    // Identify critical issues
    const issues = [];

    // 1. Delayed bookings
    const delayedBookings = allBookings.filter(b => b.status === 'delayed');
    for (const b of delayedBookings) {
      const service = services.find(s => s.id === b.service_id);
      const provider = providers.find(p => p.id === b.assigned_provider_id);
      const customer = users.find(u => u.id === b.customer_id);
      const property = properties.find(p => p.id === b.property_id);
      issues.push({
        type: 'DELAYED',
        severity: 'high',
        booking_id: b.id,
        service: service?.name || 'Unknown',
        provider: provider?.full_name || 'Unassigned',
        customer: customer?.full_name || 'Unknown',
        location: property?.address || 'Unknown',
        time: b.scheduled_time || 'N/A',
        reason: b.delay_reason || 'No reason provided',
        amount: b.total_amount,
      });
    }

    // 2. Bookings still pending/confirmed but time has passed (should be in_progress or en_route)
    const nowHour = new Date().getHours();
    const overdueBookings = allBookings.filter(b => {
      if (!['confirmed', 'pending'].includes(b.status)) return false;
      if (!b.scheduled_time) return false;
      const startHour = parseInt(b.scheduled_time.split(':')[0] || '0');
      return nowHour >= startHour + 1; // More than 1 hour past scheduled start
    });
    for (const b of overdueBookings) {
      const service = services.find(s => s.id === b.service_id);
      const provider = providers.find(p => p.id === b.assigned_provider_id);
      const customer = users.find(u => u.id === b.customer_id);
      issues.push({
        type: 'OVERDUE_START',
        severity: 'critical',
        booking_id: b.id,
        service: service?.name || 'Unknown',
        provider: provider?.full_name || 'Unassigned',
        customer: customer?.full_name || 'Unknown',
        time: b.scheduled_time || 'N/A',
        status: b.status,
        amount: b.total_amount,
      });
    }

    // 3. Unassigned bookings for today
    const unassigned = allBookings.filter(b =>
      !b.assigned_provider_id && !['completed', 'cancelled'].includes(b.status)
    );
    for (const b of unassigned) {
      const service = services.find(s => s.id === b.service_id);
      const customer = users.find(u => u.id === b.customer_id);
      issues.push({
        type: 'UNASSIGNED',
        severity: 'critical',
        booking_id: b.id,
        service: service?.name || 'Unknown',
        customer: customer?.full_name || 'Unknown',
        time: b.scheduled_time || 'N/A',
        amount: b.total_amount,
      });
    }

    if (issues.length === 0) {
      console.log('No critical issues found for today');
      return Response.json({ success: true, alerts_sent: 0, reason: 'no_issues' });
    }

    console.log(`Found ${issues.length} critical issues for today`);

    // Use AI to compose a concise admin alert
    const aiAlert = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are INAYA's operations monitoring system. Compose a critical alert email body (HTML, no subject) for admin staff.

Date: ${today}
Total bookings today: ${allBookings.length}
Critical issues found: ${issues.length}

Issues:
${JSON.stringify(issues, null, 2)}

Create a clear, scannable HTML alert with:
1. Executive summary (X issues requiring attention)
2. Issues sorted by severity (critical first, then high)
3. For each issue:
   - Clear icon/emoji for type (🔴 critical, 🟡 delayed)
   - What happened
   - Customer affected and amount at risk
   - Provider involved (if any)
   - Recommended immediate action
4. A summary of total financial impact (sum of affected booking amounts)

Use red (#dc2626) for critical, amber (#f59e0b) for high severity. 
Keep it concise and action-oriented — admins need to act fast.`,
    });

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const totalAtRisk = issues.reduce((sum, i) => sum + (i.amount || 0), 0);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #fef2f2; padding: 25px; border: 1px solid #fecaca; border-top: none; }
  .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af; border-radius: 0 0 8px 8px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">⚠️ Operations Alert — ${issues.length} Issue${issues.length > 1 ? 's' : ''}</h2>
    <p style="margin:5px 0 0;opacity:.85">${criticalCount} critical · AED ${totalAtRisk.toLocaleString()} at risk</p>
  </div>
  <div class="content">
    ${aiAlert}
    <p style="text-align:center;margin-top:20px;font-size:13px;">
      <strong>Action required.</strong> Log in to the admin dashboard to resolve these issues.
    </p>
  </div>
  <div class="footer">&copy; 2026 INAYA Facilities Management Services L.L.C.</div>
</div>
</body>
</html>`;

    let sent = 0;
    for (const admin of admins) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `⚠️ URGENT: ${issues.length} Job Issue${issues.length > 1 ? 's' : ''} Today — AED ${totalAtRisk.toLocaleString()} at risk`,
        body: emailHtml,
        from_name: 'INAYA Operations Alert'
      });
      sent++;
      console.log(`Alert sent to admin ${admin.email}`);
    }

    return Response.json({
      success: true,
      alerts_sent: sent,
      issues_found: issues.length,
      critical: criticalCount,
      total_at_risk: totalAtRisk,
    });
  } catch (error) {
    console.error('adminDelayAlerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});