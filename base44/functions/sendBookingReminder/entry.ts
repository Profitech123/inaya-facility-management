import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate tomorrow's date (24h window)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for confirmed bookings on ${tomorrowStr}`);

    // Fetch all confirmed bookings scheduled for tomorrow
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      scheduled_date: tomorrowStr,
      status: 'confirmed',
    });

    console.log(`Found ${bookings.length} confirmed booking(s) for tomorrow`);

    if (bookings.length === 0) {
      return Response.json({ success: true, reminders_sent: 0 });
    }

    let sent = 0;

    for (const booking of bookings) {
      try {
        // Fetch related data
        const [customers, services, properties] = await Promise.all([
          base44.asServiceRole.entities.User.filter({ id: booking.customer_id }),
          base44.asServiceRole.entities.Service.filter({ id: booking.service_id }),
          base44.asServiceRole.entities.Property.filter({ id: booking.property_id }),
        ]);

        const customer = customers?.[0];
        const service = services?.[0];
        const property = properties?.[0];

        if (!customer?.email) {
          console.log(`Skipping booking ${booking.id} — no customer email`);
          continue;
        }

        const bookingDate = new Date(booking.scheduled_date + 'T00:00:00').toLocaleDateString('en-AE', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

        const serviceName = service?.name || 'your scheduled service';
        const address = property ? `${property.address}${property.area ? ', ' + property.area : ''}` : '';

        // 1. In-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_id: booking.customer_id,
          type: 'general',
          title: `Reminder: ${serviceName} Tomorrow`,
          message: `Your ${serviceName} is scheduled for tomorrow${booking.scheduled_time ? ' at ' + booking.scheduled_time : ''}. Please ensure property access is available.`,
          link_page: 'MyBookings',
          link_params: '',
          related_entity_type: 'Booking',
          related_entity_id: booking.id,
          is_read: false,
        });

        // 2. Email reminder
        const emailBody = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
  .details { background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; margin: 16px 0; }
  .row { padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; gap: 12px; }
  .row:last-child { border-bottom: none; }
  .label { font-weight: 600; color: #6b7280; white-space: nowrap; }
  .checklist { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .checklist h3 { margin: 0 0 10px; color: #047857; font-size: 14px; }
  .checklist ul { margin: 0; padding-left: 18px; }
  .checklist li { font-size: 13px; color: #374151; padding: 3px 0; }
  .footer { background: #f3f4f6; padding: 14px; text-align: center; font-size: 11px; color: #9ca3af; border-radius: 0 0 8px 8px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <p style="margin:0 0 6px;font-size:13px;opacity:.8;text-transform:uppercase;letter-spacing:1px">Service Reminder</p>
    <h1 style="margin:0;font-size:22px;">⏰ Your Service is Tomorrow</h1>
  </div>
  <div class="content">
    <p>Hi ${customer.full_name},</p>
    <p>This is a friendly reminder that your <strong>${serviceName}</strong> is scheduled for <strong>tomorrow</strong>. Please make sure property access is available for our technician.</p>

    <div class="details">
      <div class="row"><span class="label">Service:</span><span>${serviceName}</span></div>
      <div class="row"><span class="label">Date:</span><span>${bookingDate}</span></div>
      <div class="row"><span class="label">Time:</span><span>${booking.scheduled_time || 'To be confirmed'}</span></div>
      ${address ? `<div class="row"><span class="label">Location:</span><span>${address}</span></div>` : ''}
      <div class="row"><span class="label">Amount:</span><span>AED ${booking.total_amount}</span></div>
    </div>

    <div class="checklist">
      <h3>✅ Access Checklist</h3>
      <ul>
        <li>Ensure someone is home or gate/door access is arranged</li>
        <li>Clear the work area for our technician</li>
        <li>Have any relevant instructions or keys ready</li>
        <li>Ensure pets are secured if applicable</li>
      </ul>
    </div>

    <p style="font-size:13px;color:#6b7280;">Need to reschedule? Please contact us at least 24 hours in advance to avoid cancellation fees.</p>
    <p style="text-align:center;margin-top:20px;font-size:13px;">
      <strong>Phone:</strong> +971 4 815 7300 &middot; <strong>Email:</strong> info@inaya.ae
    </p>
  </div>
  <div class="footer">&copy; 2026 INAYA Facilities Management Services L.L.C.</div>
</div>
</body>
</html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `Reminder: ${serviceName} is scheduled for tomorrow`,
          body: emailBody,
          from_name: 'INAYA Facilities Management',
        });

        sent++;
        console.log(`Reminder sent to ${customer.email} for booking ${booking.id}`);
      } catch (err) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, err.message);
      }
    }

    return Response.json({ success: true, reminders_sent: sent, total_checked: bookings.length });
  } catch (error) {
    console.error('sendBookingReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});