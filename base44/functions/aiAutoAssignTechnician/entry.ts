import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const { booking_id } = await req.json();

    if (!booking_id) return Response.json({ error: 'booking_id required' }, { status: 400 });

    console.log(`Auto-assigning technician for booking: ${booking_id}`);

    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    const booking = bookings?.[0];
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const [service, providers, allBookings] = await Promise.all([
      base44.asServiceRole.entities.Service.filter({ id: booking.service_id }).then(r => r?.[0]),
      base44.asServiceRole.entities.Provider.filter({ is_active: true }),
      base44.asServiceRole.entities.Booking.filter({ status: 'confirmed' }),
    ]);

    if (!providers || providers.length === 0) {
      return Response.json({ success: false, reason: 'No active providers' });
    }

    // Build provider workload map
    const workloadMap = {};
    for (const b of allBookings) {
      if (b.assigned_provider_id && b.scheduled_date === booking.scheduled_date) {
        workloadMap[b.assigned_provider_id] = (workloadMap[b.assigned_provider_id] || 0) + 1;
      }
    }

    // Build provider context for AI scoring
    const providerContext = providers.map(p => ({
      id: p.id,
      name: p.full_name,
      specialization: p.specialization || [],
      rating: p.average_rating || 4.0,
      jobs_completed: p.total_jobs_completed || 0,
      jobs_today: workloadMap[p.id] || 0,
    }));

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are assigning a technician for a facilities management job.

Service: ${service?.name || 'General service'}
Category: ${service?.category_id || 'General'}
Date: ${booking.scheduled_date}

Available technicians:
${JSON.stringify(providerContext, null, 2)}

Score each technician based on:
1. Specialization match (highest weight - 40%)
2. Rating (30%)
3. Current workload - prefer lower (20%)
4. Jobs completed - prefer experienced (10%)

Return the best technician ID and a short reason (max 15 words).`,
      response_json_schema: {
        type: "object",
        properties: {
          best_provider_id: { type: "string" },
          reason: { type: "string" },
          scores: { type: "array", items: { type: "object", properties: { id: { type: "string" }, score: { type: "number" } } } }
        }
      }
    });

    console.log(`AI recommendation: ${aiResult.best_provider_id} — ${aiResult.reason}`);

    if (aiResult.best_provider_id) {
      await base44.asServiceRole.entities.Booking.update(booking_id, {
        assigned_provider_id: aiResult.best_provider_id,
        admin_notes: `Auto-assigned by AI: ${aiResult.reason}`
      });

      return Response.json({
        success: true,
        assigned_provider_id: aiResult.best_provider_id,
        reason: aiResult.reason
      });
    }

    return Response.json({ success: false, reason: 'AI could not determine best match' });
  } catch (error) {
    console.error('aiAutoAssignTechnician error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});