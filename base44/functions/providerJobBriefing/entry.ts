import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get all confirmed bookings for tomorrow
    const allBookings = await base44.asServiceRole.entities.Booking.filter({ scheduled_date: tomorrowStr });
    const activeBookings = allBookings.filter(b => ['confirmed', 'en_route', 'in_progress'].includes(b.status));

    console.log(`Found ${activeBookings.length} active bookings for tomorrow (${tomorrowStr})`);

    if (activeBookings.length === 0) {
      return Response.json({ success: true, briefings_sent: 0 });
    }

    // Load all needed data
    const [providers, services, properties, users] = await Promise.all([
      base44.asServiceRole.entities.Provider.list(),
      base44.asServiceRole.entities.Service.list(),
      base44.asServiceRole.entities.Property.list(),
      base44.asServiceRole.entities.User.list(),
    ]);

    // Group bookings by provider
    const providerBookingsMap = {};
    for (const booking of activeBookings) {
      if (!booking.assigned_provider_id) continue;
      if (!providerBookingsMap[booking.assigned_provider_id]) {
        providerBookingsMap[booking.assigned_provider_id] = [];
      }
      providerBookingsMap[booking.assigned_provider_id].push(booking);
    }

    let sent = 0;

    for (const [providerId, provBookings] of Object.entries(providerBookingsMap)) {
      const provider = providers.find(p => p.id === providerId);
      if (!provider?.email) continue;

      // Sort bookings by time
      provBookings.sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

      // Build job details for AI
      const jobDetails = provBookings.map((b, idx) => {
        const service = services.find(s => s.id === b.service_id);
        const property = properties.find(p => p.id === b.property_id);
        const customer = users.find(u => u.id === b.customer_id);
        return {
          order: idx + 1,
          service: service?.name || 'Service',
          time: b.scheduled_time || 'TBD',
          duration_minutes: service?.duration_minutes || 60,
          address: property?.address || 'TBD',
          area: property?.area || '',
          property_type: property?.property_type || '',
          bedrooms: property?.bedrooms || 0,
          customer_name: customer?.full_name || 'Customer',
          customer_notes: b.customer_notes || '',
          access_notes: property?.access_notes || '',
        };
      });

      // AI generates smart briefing with travel estimates
      const aiBriefing = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are INAYA's smart dispatch assistant. Create a daily job briefing email for a technician in Dubai.

Technician: ${provider.full_name}
Tomorrow's date: ${tomorrowStr}
Jobs assigned (${provBookings.length}):
${JSON.stringify(jobDetails, null, 2)}

Create an HTML email body (no subject) with:
1. A warm greeting and summary ("You have X jobs tomorrow")
2. For EACH job in order:
   - Job number, service name, time slot
   - Location (address, area) with estimated travel time from previous location
   - Customer name and any special notes/access instructions
   - Property details (type, bedrooms) for preparation
   - What tools/materials to bring for this specific service
3. Estimated travel times between jobs (use typical Dubai traffic patterns - morning rush 7-9am, afternoon 1-3pm)
4. A total estimated work day timeline
5. Weather context for Dubai (outdoor vs indoor work considerations)
6. Reminder to upload completion photos and notes after each job

Use a clean, easy-to-scan format with clear headers. Use emerald green (#059669) for accents.
Keep each job section concise but informative.`,
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; border-top: none; }
  .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af; border-radius: 0 0 8px 8px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h2 style="margin:0">📋 Tomorrow's Job Briefing</h2>
    <p style="margin:5px 0 0;opacity:.85">${provBookings.length} job${provBookings.length > 1 ? 's' : ''} scheduled</p>
  </div>
  <div class="content">
    ${aiBriefing}
    <p style="text-align:center;margin-top:20px;font-size:13px;">
      Questions? Contact dispatch: <strong>+971 4 815 7300</strong>
    </p>
  </div>
  <div class="footer">&copy; 2026 INAYA Facilities Management Services L.L.C.</div>
</div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: provider.email,
        subject: `📋 Tomorrow's Briefing — ${provBookings.length} Job${provBookings.length > 1 ? 's' : ''} (${tomorrowStr})`,
        body: emailHtml,
        from_name: 'INAYA Dispatch'
      });

      sent++;
      console.log(`Briefing sent to ${provider.full_name} (${provider.email}) — ${provBookings.length} jobs`);
    }

    return Response.json({ success: true, briefings_sent: sent, total_providers: Object.keys(providerBookingsMap).length });
  } catch (error) {
    console.error('providerJobBriefing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});