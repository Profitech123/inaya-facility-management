import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Helper: send SMS via internal function (fire-and-forget, never throws)
async function sendSMS(base44, phone, message) {
  if (!phone) return;
  try {
    await base44.asServiceRole.functions.invoke('sendSMSInternal', { to: phone, message });
  } catch (e) {
    console.warn('SMS send failed (non-critical):', e.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data, old_data } = payload;

    if (!event || !data) {
      return Response.json({ skipped: true, reason: 'No event/data' });
    }

    console.log(`Booking event: ${event.type} for ${event.entity_id}`);

    // ─── Helpers ────────────────────────────────────────────────────────────
    async function getById(entityName, id) {
      if (!id) return null;
      const results = await base44.asServiceRole.entities[entityName].filter({ id });
      return results?.[0] || null;
    }

    async function createNotification({ userId, type, title, message, linkPage, relatedId }) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type,
        title,
        message,
        link_page: linkPage || 'MyBookings',
        related_entity_type: 'Booking',
        related_entity_id: relatedId || event.entity_id,
      });
    }

    // Fetch template from DB, fall back to a plain-text body if not found
    async function getTemplate(templateKey) {
      const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ template_key: templateKey });
      return templates?.[0] || null;
    }

    // Replace {{placeholder}} tokens in subject + body
    function fillTemplate(template, vars) {
      let subject = template.subject || '';
      let body = template.body || '';
      for (const [key, val] of Object.entries(vars)) {
        const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(re, val ?? '');
        body = body.replace(re, val ?? '');
      }
      return { subject, body };
    }

    async function sendTemplateEmail(templateKey, to, vars, fallbackSubject) {
      const template = await getTemplate(templateKey);
      if (!template || template.is_active === false) {
        console.log(`Template "${templateKey}" not found or disabled — skipping email`);
        return;
      }
      const { subject, body } = fillTemplate(template, { company_name: 'INAYA Facilities Management', ...vars });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: subject || fallbackSubject,
        body,
        from_name: 'INAYA Facilities Management',
      });
      console.log(`Email sent [${templateKey}] → ${to}`);
    }

    // ─── 1. NEW BOOKING CREATED ─────────────────────────────────────────────
    if (event.type === 'create') {
      const booking = data;

      const [customer, service, property] = await Promise.all([
        getById('User', booking.customer_id),
        getById('Service', booking.service_id),
        getById('Property', booking.property_id),
      ]);

      if (!customer?.email) {
        console.log('No customer email, skipping confirmation');
        return Response.json({ skipped: true, reason: 'No customer email' });
      }

      const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-AE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      await createNotification({
        userId: booking.customer_id,
        type: 'booking_confirmed',
        title: `Booking Confirmed — ${service?.name}`,
        message: `Your ${service?.name} on ${bookingDate}${booking.scheduled_time ? ' at ' + booking.scheduled_time : ''} has been confirmed.`,
      });

      await sendTemplateEmail('booking_confirmed', customer.email, {
        customer_name: customer.full_name,
        customer_email: customer.email,
        booking_id: `INY-${event.entity_id.substring(0, 8).toUpperCase()}`,
        service_name: service?.name || '',
        scheduled_date: bookingDate,
        scheduled_time: booking.scheduled_time || 'To be confirmed',
        total_amount: (booking.total_amount || 0).toString(),
        provider_name: booking.assigned_provider || 'To be assigned',
        property_address: `${property?.address || ''}${property?.area ? ', ' + property.area : ''}`,
      }, `Booking Confirmed — ${service?.name}`);

      // SMS confirmation
      if (customer.phone) {
        await sendSMS(base44, customer.phone,
          `INAYA: Your ${service?.name} booking is confirmed for ${bookingDate}${booking.scheduled_time ? ' at ' + booking.scheduled_time : ''}. Ref: INY-${event.entity_id.substring(0, 8).toUpperCase()}`
        );
      }

      return Response.json({ success: true, action: 'confirmation_sent' });
    }

    // ─── 2. BOOKING STATUS UPDATED ──────────────────────────────────────────
    if (event.type === 'update' && old_data && data.status !== old_data.status) {
      const booking = data;
      const oldStatus = old_data.status;
      const newStatus = data.status;

      console.log(`Status change: ${oldStatus} → ${newStatus}`);

      const [customer, service] = await Promise.all([
        getById('User', booking.customer_id),
        getById('Service', booking.service_id),
      ]);

      if (!customer?.email) {
        return Response.json({ skipped: true, reason: 'No customer email' });
      }

      const statusNotifMap = {
        confirmed: 'booking_confirmed',
        en_route: 'technician_en_route',
        in_progress: 'service_in_progress',
        completed: 'service_completed',
        cancelled: 'booking_cancelled',
        delayed: 'booking_delayed',
      };

      const statusMessages = {
        confirmed: `Your ${service?.name} booking has been confirmed.`,
        en_route: `Your technician is on the way for ${service?.name}. Please ensure property access.`,
        in_progress: `Your ${service?.name} service has started.`,
        completed: `Your ${service?.name} service is complete! We'd love to hear your feedback.`,
        cancelled: `Your ${service?.name} booking has been cancelled.`,
        delayed: `Your ${service?.name} has been delayed. ${booking.delay_reason || 'We apologize for the inconvenience.'}`,
      };

      const statusTitles = {
        confirmed: 'Booking Confirmed',
        en_route: 'Technician En Route 🚗',
        in_progress: 'Service In Progress 🔧',
        completed: 'Service Completed ✓',
        cancelled: 'Booking Cancelled',
        delayed: 'Service Delayed ⚠️',
      };

      await createNotification({
        userId: booking.customer_id,
        type: statusNotifMap[newStatus] || 'general',
        title: statusTitles[newStatus] || `Booking Update — ${service?.name}`,
        message: statusMessages[newStatus] || `Your booking status changed to ${newStatus}.`,
      });

      // Map status to template key
      const statusTemplateMap = {
        en_route: 'technician_en_route',
        completed: 'service_completed',
        cancelled: 'booking_cancelled',
      };

      const templateKey = statusTemplateMap[newStatus] || 'booking_status_update';

      const property = newStatus === 'en_route' ? await getById('Property', booking.property_id) : null;
      const provider = booking.assigned_provider_id ? await getById('Provider', booking.assigned_provider_id) : null;

      const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-AE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      await sendTemplateEmail(templateKey, customer.email, {
        customer_name: customer.full_name,
        booking_id: `INY-${event.entity_id.substring(0, 8).toUpperCase()}`,
        service_name: service?.name || '',
        booking_status: newStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        scheduled_date: bookingDate,
        scheduled_time: booking.scheduled_time || '',
        provider_name: provider?.full_name || booking.assigned_provider || 'INAYA Team',
        property_address: property ? `${property.address || ''}${property.area ? ', ' + property.area : ''}` : '',
        total_amount: (booking.total_amount || 0).toString(),
        cancellation_reason: booking.cancellation_reason || 'N/A',
      }, `Booking ${newStatus.replace(/_/g, ' ')} — ${service?.name}`);

      // SMS status updates for key statuses
      if (customer.phone && ['en_route', 'completed', 'cancelled'].includes(newStatus)) {
        const smsMessages = {
          en_route: `INAYA: Your technician is on the way for ${service?.name}. Please ensure property access is ready.`,
          completed: `INAYA: Your ${service?.name} service is complete! Rate your experience in the app.`,
          cancelled: `INAYA: Your ${service?.name} booking has been cancelled. Contact us at +971 4 815 7300 for assistance.`,
        };
        await sendSMS(base44, customer.phone, smsMessages[newStatus]);
      }

      // Auto-generate invoice + AI service report on completion
      if (newStatus === 'completed') {
        console.log(`Job completed — triggering invoice + AI service report for booking ${event.entity_id}`);
        await Promise.all([
          base44.asServiceRole.functions.invoke('generateInvoicePDF', { booking_id: event.entity_id }),
          base44.asServiceRole.functions.invoke('aiServiceReport', { booking_id: event.entity_id }),
        ]);
      }

      // Delayed → alert admins
      if (newStatus === 'delayed') {
        const admins = (await base44.asServiceRole.entities.User.list()).filter(u => u.role === 'admin' && u.email);
        const property2 = await getById('Property', booking.property_id);
        const provider2 = booking.assigned_provider_id ? await getById('Provider', booking.assigned_provider_id) : null;

        for (const admin of admins) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: admin.email,
            subject: `⚠️ Job Delayed: ${service?.name} — ${customer.full_name}`,
            body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#dc2626;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center">
    <h2 style="margin:0">⚠️ Job Delay Alert</h2>
  </div>
  <div style="background:#fef2f2;padding:20px;border:1px solid #fecaca;border-top:none;border-radius:0 0 8px 8px">
    <p><strong>Service:</strong> ${service?.name}</p>
    <p><strong>Customer:</strong> ${customer.full_name} (${customer.email})</p>
    <p><strong>Provider:</strong> ${provider2?.full_name || 'Unassigned'}</p>
    <p><strong>Scheduled:</strong> ${booking.scheduled_date} at ${booking.scheduled_time || 'N/A'}</p>
    <p><strong>Location:</strong> ${property2?.address || 'N/A'}</p>
    <p><strong>Delay Reason:</strong> ${booking.delay_reason || 'Not specified'}</p>
    <p style="text-align:center;margin-top:15px"><strong>Please review and take action in the admin dashboard.</strong></p>
  </div>
</div>`,
            from_name: 'INAYA Operations Alert',
          });
        }
        console.log(`Delay alert sent to ${admins.length} admin(s)`);
      }

      return Response.json({ success: true, action: 'status_update_sent', from: oldStatus, to: newStatus });
    }

    // ─── 3. PROVIDER ASSIGNED ───────────────────────────────────────────────
    if (event.type === 'update' && old_data && data.assigned_provider_id && data.assigned_provider_id !== old_data.assigned_provider_id) {
      const booking = data;
      const [service, provider] = await Promise.all([
        getById('Service', booking.service_id),
        getById('Provider', booking.assigned_provider_id),
      ]);

      await createNotification({
        userId: booking.customer_id,
        type: 'provider_assigned',
        title: 'Technician Assigned',
        message: `${provider?.full_name || 'A technician'} has been assigned to your ${service?.name} service.`,
      });

      // Notify customer via template
      const customer = await getById('User', booking.customer_id);
      if (customer?.email) {
        const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-AE', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        await sendTemplateEmail('technician_assigned', customer.email, {
          customer_name: customer.full_name,
          booking_id: `INY-${event.entity_id.substring(0, 8).toUpperCase()}`,
          service_name: service?.name || '',
          provider_name: provider?.full_name || 'Your technician',
          scheduled_date: bookingDate,
          scheduled_time: booking.scheduled_time || 'To be confirmed',
        }, `Technician Assigned — ${service?.name}`);
      }

      // Notify provider
      if (!provider?.email) {
        return Response.json({ success: true, action: 'customer_notified_no_provider_email' });
      }

      const [property, customerData] = await Promise.all([
        getById('Property', booking.property_id),
        customer || getById('User', booking.customer_id),
      ]);

      const aiBody = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a concise HTML email body (no subject) for a technician being assigned a new job:
- Technician: ${provider.full_name}
- Service: ${service?.name} (estimated ${service?.duration_minutes || 60} min)
- Customer: ${customerData?.full_name}
- Date: ${booking.scheduled_date}
- Time: ${booking.scheduled_time || 'TBD'}
- Location: ${property?.address || ''}, ${property?.area || ''}, Dubai
- Access notes: ${property?.access_notes || 'None'}
- Customer notes: ${booking.customer_notes || 'None'}
- Amount: AED ${booking.total_amount}
Include: what tools/materials to prepare, and a reminder to update job status. Keep it professional and under 5 sentences.`,
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: provider.email,
        subject: `🔧 New Job Assigned: ${service?.name} — ${booking.scheduled_date}`,
        body: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1e293b,#334155);color:white;padding:25px;text-align:center;border-radius:8px 8px 0 0">
    <h2 style="margin:0">🔧 New Job Assignment</h2>
    <p style="margin:5px 0 0;opacity:.85">${service?.name}</p>
  </div>
  <div style="background:#f9fafb;padding:25px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    ${aiBody}
    <p style="text-align:center;margin-top:20px;font-size:13px;">Questions? Contact dispatch: <strong>+971 4 815 7300</strong></p>
  </div>
</div>`,
        from_name: 'INAYA Dispatch',
      });

      console.log(`Assignment notification sent to provider ${provider.full_name}`);
      return Response.json({ success: true, action: 'provider_assignment_sent' });
    }

    return Response.json({ skipped: true, reason: 'No matching condition' });
  } catch (error) {
    console.error('onBookingEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});