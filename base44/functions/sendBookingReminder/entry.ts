import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate tomorrow's date (24h window)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for confirmed bookings on ${tomorrowStr}`);

    const bookings = await base44.asServiceRole.entities.Booking.filter({
      scheduled_date: tomorrowStr,
      status: 'confirmed',
    });

    console.log(`Found ${bookings.length} confirmed booking(s) for tomorrow`);

    if (bookings.length === 0) {
      return Response.json({ success: true, reminders_sent: 0 });
    }

    // Fetch the reminder template once
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ template_key: 'booking_reminder' });
    const template = templates?.[0];

    if (!template || template.is_active === false) {
      console.log('booking_reminder template not found or disabled — skipping all reminders');
      return Response.json({ success: true, reminders_sent: 0, reason: 'template_disabled' });
    }

    let sent = 0;

    for (const booking of bookings) {
      try {
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

        const address = property ? `${property.address}${property.area ? ', ' + property.area : ''}` : '';

        // Replace template placeholders
        const vars = {
          customer_name: customer.full_name,
          service_name: service?.name || 'your scheduled service',
          scheduled_date: bookingDate,
          scheduled_time: booking.scheduled_time || 'To be confirmed',
          property_address: address,
          total_amount: (booking.total_amount || 0).toString(),
          booking_id: `INY-${booking.id.substring(0, 8).toUpperCase()}`,
          company_name: 'INAYA Facilities Management',
        };

        let subject = template.subject || `Reminder: ${service?.name} is scheduled for tomorrow`;
        let body = template.body || '';
        for (const [key, val] of Object.entries(vars)) {
          const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          subject = subject.replace(re, val ?? '');
          body = body.replace(re, val ?? '');
        }

        // In-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_id: booking.customer_id,
          type: 'general',
          title: `Reminder: ${service?.name || 'Service'} Tomorrow`,
          message: `Your ${service?.name || 'service'} is scheduled for tomorrow${booking.scheduled_time ? ' at ' + booking.scheduled_time : ''}. Please ensure property access is available.`,
          link_page: 'MyBookings',
          related_entity_type: 'Booking',
          related_entity_id: booking.id,
          is_read: false,
        });

        // Email reminder from template
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject,
          body,
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