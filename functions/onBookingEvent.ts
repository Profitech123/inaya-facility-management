import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { event, data, old_data } = payload;
    
    if (!event || !data) {
      return Response.json({ skipped: true, reason: 'No event/data' });
    }

    console.log(`Booking event: ${event.type} for ${event.entity_id}`);

    // === 1. NEW BOOKING CREATED → Send Confirmation ===
    if (event.type === 'create') {
      const booking = data;
      
      const [customer, service, property] = await Promise.all([
        base44.asServiceRole.entities.User.read(booking.customer_id),
        base44.asServiceRole.entities.Service.read(booking.service_id),
        base44.asServiceRole.entities.Property.read(booking.property_id),
      ]);

      if (!customer?.email) {
        console.log('No customer email, skipping confirmation');
        return Response.json({ skipped: true, reason: 'No customer email' });
      }

      const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-AE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const confirmNum = `INY-${event.entity_id.substring(0, 8).toUpperCase()}`;

      const emailBody = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
  .details { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #059669; margin: 15px 0; }
  .row { padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; }
  .row:last-child { border-bottom: none; }
  .label { font-weight: 600; color: #6b7280; }
  .total { background: #f0fdf4; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
  .total-amt { font-size: 32px; font-weight: bold; color: #059669; }
  .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 15px 0; font-size: 13px; }
  .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af; border-radius: 0 0 8px 8px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1 style="margin:0;font-size:24px;">✓ Booking Confirmed</h1>
    <p style="margin:5px 0 0;opacity:.85">Confirmation #${confirmNum}</p>
  </div>
  <div class="content">
    <p>Hi ${customer.full_name},</p>
    <p>Thank you for booking with INAYA Facilities Management. Here are your booking details:</p>
    <div class="details">
      <div class="row"><span class="label">Service:</span><span>${service.name}</span></div>
      <div class="row"><span class="label">Date:</span><span>${bookingDate}</span></div>
      <div class="row"><span class="label">Time:</span><span>${booking.scheduled_time || 'To be confirmed'}</span></div>
      <div class="row"><span class="label">Location:</span><span>${property.address}${property.area ? ', ' + property.area : ''}</span></div>
      <div class="row"><span class="label">Property:</span><span>${(property.property_type || '').charAt(0).toUpperCase() + (property.property_type || '').slice(1)}</span></div>
    </div>
    ${booking.customer_notes ? `<div class="details"><strong>Your Notes:</strong> ${booking.customer_notes}</div>` : ''}
    <div class="total">
      <div style="font-size:13px;color:#6b7280;margin-bottom:5px;">Total Amount</div>
      <div class="total-amt">AED ${booking.total_amount || 0}</div>
    </div>
    <div class="note">
      <strong>Important:</strong> Please ensure property access during the scheduled time. For rescheduling, contact us at least 24 hours in advance.
    </div>
    <p style="text-align:center;margin-top:20px;">
      <strong>Phone:</strong> +971 4 815 7300 · <strong>Email:</strong> info@inaya.ae
    </p>
  </div>
  <div class="footer">&copy; 2026 INAYA Facilities Management Services L.L.C.</div>
</div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customer.email,
        subject: `Booking Confirmed — ${service.name} on ${bookingDate}`,
        body: emailBody,
        from_name: 'INAYA Facilities Management'
      });

      console.log(`Confirmation email sent to ${customer.email}`);
      return Response.json({ success: true, action: 'confirmation_sent' });
    }

    // === 2. BOOKING STATUS UPDATED → Send status notification ===
    if (event.type === 'update' && old_data && data.status !== old_data.status) {
      const booking = data;
      const oldStatus = old_data.status;
      const newStatus = data.status;

      console.log(`Status change: ${oldStatus} → ${newStatus}`);

      const customer = await base44.asServiceRole.entities.User.read(booking.customer_id);
      const service = await base44.asServiceRole.entities.Service.read(booking.service_id);

      if (!customer?.email) {
        return Response.json({ skipped: true, reason: 'No customer email' });
      }

      // Generate AI-powered personalized status update
      const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a brief, friendly email body (HTML, no subject line) notifying a customer about their booking status change:
- Customer: ${customer.full_name}
- Service: ${service.name}
- Old status: ${oldStatus}
- New status: ${newStatus}
- Scheduled date: ${booking.scheduled_date}
- Time: ${booking.scheduled_time || 'N/A'}
${newStatus === 'cancelled' ? '- Include info about how to rebook or contact us for help' : ''}
${newStatus === 'in_progress' ? '- Let them know the technician is on their way or has started' : ''}
${newStatus === 'completed' ? '- Thank them and mention they can leave a review in their dashboard' : ''}

Keep it 3-5 sentences. Professional and warm. Brand: INAYA Facilities Management.`,
      });

      const statusEmojis = {
        confirmed: '✅', in_progress: '🔧', completed: '✓', cancelled: '❌', pending: '⏳'
      };

      const emailBody = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  .status-badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px; margin: 15px 0; background: #f0fdf4; color: #059669; }
  .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 15px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">${statusEmojis[newStatus] || '📋'} Booking Update</h2>
    <p style="margin:5px 0 0;opacity:.85">${service.name}</p>
  </div>
  <div class="content">
    <div style="text-align:center">
      <span class="status-badge">${newStatus.replace('_', ' ').toUpperCase()}</span>
    </div>
    ${aiResponse}
    <p style="text-align:center;margin-top:20px;font-size:13px;">
      Questions? Call +971 4 815 7300 or email info@inaya.ae
    </p>
  </div>
  <div class="footer">&copy; 2026 INAYA Facilities Management Services L.L.C.</div>
</div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customer.email,
        subject: `Booking ${newStatus.replace('_', ' ')} — ${service.name}`,
        body: emailBody,
        from_name: 'INAYA Facilities Management'
      });

      console.log(`Status update email sent to ${customer.email}: ${oldStatus} → ${newStatus}`);
      return Response.json({ success: true, action: 'status_update_sent', from: oldStatus, to: newStatus });
    }

    return Response.json({ skipped: true, reason: 'No matching condition' });
  } catch (error) {
    console.error('onBookingEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});