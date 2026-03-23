import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service role for scheduled tasks
    const bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'confirmed' });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const upcomingBookings = bookings.filter(b => b.scheduled_date === tomorrowStr);

    console.log(`Found ${upcomingBookings.length} bookings for tomorrow (${tomorrowStr})`);

    let sent = 0;
    for (const booking of upcomingBookings) {
      try {
        const [customer, service, property] = await Promise.all([
          base44.asServiceRole.entities.User.read(booking.customer_id),
          base44.asServiceRole.entities.Service.read(booking.service_id),
          base44.asServiceRole.entities.Property.read(booking.property_id),
        ]);

        if (!customer?.email) continue;

        const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-AE', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        // Use AI to generate a personalized reminder
        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Write a friendly, professional booking reminder email body (HTML formatted, no subject line) for:
- Customer name: ${customer.full_name}
- Service: ${service.name}
- Date: ${bookingDate}
- Time: ${booking.scheduled_time || 'Morning'}
- Property: ${property.address}, ${property.area || ''}
- Amount: AED ${booking.total_amount}

Include:
1. A warm greeting
2. Service reminder details
3. What to prepare (ensure property access, pets secured, etc.)
4. INAYA contact info: +971 4 815 7300
5. A note about rescheduling policy (24 hours notice)

Brand: INAYA Facilities Management (part of Belhasa Group, Dubai, UAE).
Use emerald green (#059669) as the brand color. Keep it concise and professional.`,
        });

        const emailBody = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">⏰ Service Reminder — Tomorrow</h2>
    <p style="margin:5px 0 0;opacity:.85">${service.name}</p>
  </div>
  <div class="content">
    ${aiResponse}
  </div>
  <div class="footer">
    <p>&copy; 2026 INAYA Facilities Management Services L.L.C.</p>
  </div>
</div>
</body>
</html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `Reminder: ${service.name} — Tomorrow, ${bookingDate}`,
          body: emailBody,
          from_name: 'INAYA Facilities Management'
        });

        sent++;
        console.log(`Reminder sent to ${customer.email} for booking ${booking.id}`);
      } catch (err) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, err.message);
      }
    }

    return Response.json({ success: true, reminders_sent: sent, total_upcoming: upcomingBookings.length });
  } catch (error) {
    console.error('sendBookingReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});