import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Generates AI service completion report and emails it to the customer
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) return Response.json({ error: 'booking_id required' }, { status: 400 });

    console.log(`Generating AI service report for booking: ${booking_id}`);

    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    const booking = bookings?.[0];
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const [service, property, customer, provider] = await Promise.all([
      base44.asServiceRole.entities.Service.filter({ id: booking.service_id }).then(r => r?.[0]),
      base44.asServiceRole.entities.Property.filter({ id: booking.property_id }).then(r => r?.[0]),
      base44.asServiceRole.entities.User.filter({ id: booking.customer_id }).then(r => r?.[0]),
      booking.assigned_provider_id
        ? base44.asServiceRole.entities.Provider.filter({ id: booking.assigned_provider_id }).then(r => r?.[0])
        : Promise.resolve(null),
    ]);

    // Generate AI summary of what was done and next steps
    const aiReport = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Write a professional service completion report for a Dubai property owner.

Service performed: ${service?.name}
Service description: ${service?.description}
Technician: ${provider?.full_name || 'INAYA Technician'}
Date: ${booking.scheduled_date}
Property: ${property?.property_type}, ${property?.bedrooms || '?'} bedrooms, ${property?.area || 'Dubai'}
Technician notes: ${booking.provider_notes || 'Service completed successfully'}
Photos taken: ${booking.completion_photos?.length || 0}

Write:
1. A 2-sentence summary of what was accomplished
2. Key work items (3-4 bullet points, inferred from the service type)
3. Next recommended service date (based on typical service intervals in Dubai)
4. 2 maintenance tips for the customer to maintain this service
5. A quality assurance note

Keep it professional, warm, and 200 words max.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          work_items: { type: "array", items: { type: "string" } },
          next_service_date: { type: "string", description: "Recommended next service (e.g., 'Within 6 months', 'January 2027')" },
          maintenance_tips: { type: "array", items: { type: "string" } },
          quality_note: { type: "string" }
        }
      }
    });

    const photoSection = booking.completion_photos?.length > 0
      ? `<div style="margin:20px 0"><strong>Completion Photos (${booking.completion_photos.length}):</strong><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${booking.completion_photos.map(url => `<img src="${url}" style="width:120px;height:90px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb">`).join('')}</div></div>`
      : '';

    const emailBody = `
<!DOCTYPE html>
<html>
<head><style>
  body{font-family:Arial,sans-serif;color:#333;line-height:1.6}
  .container{max-width:600px;margin:0 auto}
  .header{background:linear-gradient(135deg,#059669,#047857);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
  .content{background:#f9fafb;padding:25px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px}
  .section{background:white;padding:15px;border-radius:8px;margin:15px 0;border-left:4px solid #059669}
  .tip{background:#fef3c7;padding:10px 12px;border-radius:6px;margin:6px 0;font-size:13px}
  .next-date{background:#f0fdf4;padding:15px;border-radius:8px;text-align:center;margin:15px 0;border:1px solid #bbf7d0}
  li{margin:6px 0}
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1 style="margin:0;font-size:22px">✓ Service Report</h1>
    <p style="margin:5px 0 0;opacity:.85">${service?.name} — ${booking.scheduled_date}</p>
  </div>
  <div class="content">
    <p>Hi ${customer?.full_name || 'Valued Customer'},</p>
    <div class="section">
      <strong>Work Summary</strong>
      <p>${aiReport.summary}</p>
      ${aiReport.work_items?.length ? `<ul>${aiReport.work_items.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
    </div>
    ${photoSection}
    <div class="next-date">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">📅 Next Recommended Service</div>
      <div style="font-weight:bold;color:#059669;font-size:16px">${aiReport.next_service_date}</div>
    </div>
    ${aiReport.maintenance_tips?.length ? `
    <div class="section">
      <strong>💡 Maintenance Tips</strong>
      ${aiReport.maintenance_tips.map(tip => `<div class="tip">• ${tip}</div>`).join('')}
    </div>` : ''}
    <div class="section" style="border-left-color:#3b82f6">
      <strong>Quality Assurance</strong>
      <p style="margin:8px 0 0;font-size:13px">${aiReport.quality_note}</p>
    </div>
    <p style="text-align:center;margin-top:20px;font-size:13px;color:#6b7280">
      Questions? Call <strong>+971 4 815 7300</strong> or email <strong>info@inaya.ae</strong>
    </p>
  </div>
</div>
</body>
</html>`;

    if (customer?.email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customer.email,
        subject: `Service Report: ${service?.name} — ${booking.scheduled_date}`,
        body: emailBody,
        from_name: 'INAYA Service Reports'
      });
      console.log(`Service report emailed to ${customer.email}`);
    }

    return Response.json({ success: true, report: aiReport });
  } catch (error) {
    console.error('aiServiceReport error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});