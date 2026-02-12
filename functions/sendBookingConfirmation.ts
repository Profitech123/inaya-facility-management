import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id is required' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch booking details
    const booking = await base44.asServiceRole.entities.Booking.read(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Fetch related data
    const customer = await base44.asServiceRole.entities.User.read(booking.customer_id);
    const service = await base44.asServiceRole.entities.Service.read(booking.service_id);
    const property = await base44.asServiceRole.entities.Property.read(booking.property_id);

    if (!customer || !service || !property) {
      return Response.json({ error: 'Unable to fetch booking details' }, { status: 404 });
    }

    // Format booking details for email
    const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const confirmationNumber = `INY-${booking.id.substring(0, 8).toUpperCase()}`;

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #059669; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
    .details { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #059669; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .detail-value { color: #111827; text-align: right; }
    .total { background: linear-gradient(135deg, #f0fdf4 0%, #f3fdf5 100%); padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
    .total-amount { font-size: 32px; font-weight: bold; color: #059669; }
    .actions { text-align: center; margin-top: 30px; }
    .btn { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 0 10px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Booking Confirmed</h1>
      <p>Confirmation #${confirmationNumber}</p>
    </div>
    
    <div class="content">
      <p>Hi ${customer.full_name},</p>
      <p>Thank you for booking with INAYA Facilities Management. Your service booking has been confirmed.</p>

      <div class="section">
        <div class="section-title">Service Details</div>
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value">${service.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${bookingDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot:</span>
            <span class="detail-value">${booking.scheduled_time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${property.address}, ${property.area}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Property Type:</span>
            <span class="detail-value">${property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}</span>
          </div>
        </div>
      </div>

      ${booking.customer_notes ? `
      <div class="section">
        <div class="section-title">Special Instructions</div>
        <div class="details">
          <p>${booking.customer_notes}</p>
        </div>
      </div>
      ` : ''}

      <div class="total">
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Total Amount</div>
        <div class="total-amount">AED ${booking.total_amount}</div>
      </div>

      <div class="note">
        <strong>Important:</strong> Please ensure someone is at the property during the scheduled time slot. If you need to reschedule, please contact us at least 24 hours in advance.
      </div>

      <div class="section">
        <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact our customer service team.</p>
      </div>

      <div class="actions">
        <p>
          <strong>Phone:</strong> +971 4 815 7300<br>
          <strong>Email:</strong> info@inaya.ae
        </p>
      </div>
    </div>

    <div class="footer">
      <p>&copy; 2026 INAYA Facilities Management Services L.L.C. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await base44.integrations.Core.SendEmail({
      to: customer.email,
      subject: `Booking Confirmation - ${service.name}`,
      body: emailBody,
      from_name: 'INAYA Facilities Management'
    });

    return Response.json({ 
      success: true, 
      message: 'Confirmation email sent',
      confirmation_number: confirmationNumber 
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return Response.json({ 
      error: error.message || 'Failed to send confirmation email' 
    }, { status: 500 });
  }
});