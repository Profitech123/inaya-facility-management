import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all customers, their properties, past bookings, and services
    const [users, properties, bookings, services, subscriptions] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Property.list(),
      base44.asServiceRole.entities.Booking.list('-scheduled_date', 500),
      base44.asServiceRole.entities.Service.list(),
      base44.asServiceRole.entities.Subscription.list(),
    ]);

    const customers = users.filter(u => u.role !== 'admin');
    const now = new Date();
    const currentMonth = now.toLocaleString('en', { month: 'long' });
    const currentMonthNum = now.getMonth() + 1;

    let notified = 0;

    for (const customer of customers) {
      const customerProperties = properties.filter(p => p.owner_id === customer.id);
      if (customerProperties.length === 0) continue;

      const customerBookings = bookings.filter(b => b.customer_id === customer.id);
      const activeSubs = subscriptions.filter(s => s.customer_id === customer.id && s.status === 'active');

      const bookedServiceNames = customerBookings
        .map(b => services.find(s => s.id === b.service_id)?.name)
        .filter(Boolean);

      const lastBookingDate = customerBookings.length > 0
        ? customerBookings[0].scheduled_date
        : null;

      const propertyDetails = customerProperties.map(p =>
        `${p.property_type || 'property'} in ${p.area || 'Dubai'} (${p.bedrooms || '?'} bedrooms)`
      ).join(', ');

      const serviceList = services.map(s => `${s.name} (AED ${s.price})`).join(', ');

      // Use AI to determine if this customer needs a proactive maintenance nudge
      const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are INAYA's proactive maintenance advisor in Dubai, UAE.

Customer: ${customer.full_name}
Properties: ${propertyDetails}
Past services booked: ${bookedServiceNames.length > 0 ? bookedServiceNames.join(', ') : 'None'}
Last booking date: ${lastBookingDate || 'Never'}
Has active subscription: ${activeSubs.length > 0 ? 'Yes' : 'No'}
Current month: ${currentMonth} (month ${currentMonthNum})
Available services: ${serviceList}

Dubai seasonal context:
- Jan-Mar: Perfect for outdoor painting, landscaping prep, pest control (mild weather)
- Apr-May: Pre-summer AC deep servicing critical, pool opening prep, water tank cleaning
- Jun-Sep: Peak AC season (breakdowns common), indoor-focused maintenance, pest surges
- Oct-Nov: Post-summer AC check, outdoor restoration, garden planting season
- Dec: Year-end deep cleaning, annual maintenance checks, holiday prep

Based on the customer's properties, booking history, and the current season, decide:
1. Should we send a proactive maintenance recommendation? (only if genuinely useful and not redundant)
2. If yes, what specific service(s) to recommend and why

Rules:
- If customer booked the same service recently (within 2 months), do NOT recommend it
- If customer has an active subscription covering this, skip or suggest complementary services
- If customer has never booked, recommend the most critical seasonal service
- Maximum 2 service recommendations`,
        response_json_schema: {
          type: "object",
          properties: {
            should_notify: { type: "boolean" },
            skip_reason: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service_name: { type: "string" },
                  urgency: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            email_subject: { type: "string" },
            email_body_html: { type: "string" }
          }
        }
      });

      if (!aiResult.should_notify) {
        console.log(`Skipping ${customer.full_name}: ${aiResult.skip_reason || 'Not needed'}`);
        continue;
      }

      if (!customer.email || !aiResult.email_body_html) continue;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; border-top: none; }
  .rec { background: white; border-left: 4px solid #059669; padding: 15px; border-radius: 6px; margin: 12px 0; }
  .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af; border-radius: 0 0 8px 8px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">🏠 Maintenance Recommendation</h2>
    <p style="margin:5px 0 0;opacity:.85">Tailored for your property</p>
  </div>
  <div class="content">
    ${aiResult.email_body_html}
    <p style="text-align:center;margin-top:20px;font-size:13px;">
      Book online or call us: <strong>+971 4 815 7300</strong>
    </p>
  </div>
  <div class="footer">&copy; 2026 INAYA Facilities Management Services L.L.C.</div>
</div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customer.email,
        subject: aiResult.email_subject || `${currentMonth} Maintenance Recommendation`,
        body: emailHtml,
        from_name: 'INAYA Facilities Management'
      });

      notified++;
      console.log(`Proactive notification sent to ${customer.full_name} (${customer.email})`);
    }

    return Response.json({ success: true, customers_notified: notified, total_customers: customers.length });
  } catch (error) {
    console.error('proactiveMaintenanceNotify error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});