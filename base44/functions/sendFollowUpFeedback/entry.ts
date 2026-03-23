import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This runs as a scheduled job — find bookings completed yesterday with no review yet
    const bookings = await base44.asServiceRole.entities.Booking.filter({ status: 'completed' });
    const reviews = await base44.asServiceRole.entities.ProviderReview.list();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get booking IDs that already have reviews
    const reviewedBookingIds = new Set(reviews.map(r => r.booking_id));

    // Find completed bookings from yesterday without reviews
    const eligibleBookings = bookings.filter(b => {
      const completedDate = b.completed_at ? b.completed_at.substring(0, 10) : b.scheduled_date;
      return completedDate === yesterdayStr && !reviewedBookingIds.has(b.id);
    });

    console.log(`Found ${eligibleBookings.length} completed bookings from yesterday without reviews`);

    let sent = 0;
    for (const booking of eligibleBookings) {
      try {
        const [customer, service, provider] = await Promise.all([
          base44.asServiceRole.entities.User.read(booking.customer_id),
          base44.asServiceRole.entities.Service.read(booking.service_id),
          booking.assigned_provider_id
            ? base44.asServiceRole.entities.Provider.read(booking.assigned_provider_id)
            : Promise.resolve(null),
        ]);

        if (!customer?.email) continue;

        const techName = provider?.full_name || 'our technician';

        // AI-generated personalized follow-up
        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Write a short, warm follow-up email body (HTML formatted, no subject) for a customer after their home service was completed:
- Customer name: ${customer.full_name}
- Service completed: ${service.name}
- Technician: ${techName}
- Date of service: ${booking.scheduled_date}

The email should:
1. Thank them for choosing INAYA
2. Ask about their experience (was the service satisfactory?)
3. Encourage them to leave a rating/review in their dashboard (My Bookings page)
4. Mention they can reach us at +971 4 815 7300 for any follow-up concerns
5. If they enjoyed the service, suggest they check out our subscription packages for regular maintenance

Keep it personal, concise, and professional. Brand: INAYA Facilities Management.`,
        });

        const emailBody = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; border-top: none; }
  .stars { text-align: center; font-size: 32px; margin: 20px 0; }
  .cta { text-align: center; margin: 25px 0; }
  .cta a { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
  .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px; border-radius: 0 0 8px 8px; background: #f3f4f6; padding: 15px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">How Was Your Experience?</h2>
    <p style="margin:5px 0 0;opacity:.85">${service.name} with ${techName}</p>
  </div>
  <div class="content">
    ${aiResponse}
    <div class="stars">⭐⭐⭐⭐⭐</div>
    <div class="cta">
      <p style="font-size:14px;color:#6b7280;">Rate your experience in your dashboard:</p>
      <a href="#">Go to My Bookings</a>
    </div>
  </div>
  <div class="footer">
    <p>Need help? Call +971 4 815 7300 or email info@inaya.ae</p>
    <p>&copy; 2026 INAYA Facilities Management Services L.L.C.</p>
  </div>
</div>
</body>
</html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `How was your ${service.name}? We'd love your feedback!`,
          body: emailBody,
          from_name: 'INAYA Facilities Management'
        });

        sent++;
        console.log(`Follow-up sent to ${customer.email} for booking ${booking.id}`);
      } catch (err) {
        console.error(`Failed to send follow-up for booking ${booking.id}:`, err.message);
      }
    }

    return Response.json({ success: true, followups_sent: sent, eligible: eligibleBookings.length });
  } catch (error) {
    console.error('sendFollowUpFeedback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});