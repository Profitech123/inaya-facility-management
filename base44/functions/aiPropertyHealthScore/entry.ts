import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { property_id } = await req.json();
    console.log(`Calculating health score for property: ${property_id}, user: ${user.id}`);

    const [bookings, subscriptions, services, property] = await Promise.all([
      base44.entities.Booking.list('-scheduled_date', 50).then(all => all.filter(b => b.customer_id === user.id)),
      base44.entities.Subscription.list().then(all => all.filter(s => s.customer_id === user.id)),
      base44.entities.Service.list(),
      property_id ? base44.entities.Property.filter({ id: property_id }).then(r => r?.[0]) : Promise.resolve(null),
    ]);

    const propertyBookings = property_id
      ? bookings.filter(b => b.property_id === property_id)
      : bookings;

    const completedBookings = propertyBookings.filter(b => b.status === 'completed');
    const activeSubscription = subscriptions.find(s => s.status === 'active');

    // Analyze last service dates per category
    const serviceHistory = completedBookings.map(b => {
      const svc = services.find(s => s.id === b.service_id);
      return { name: svc?.name || 'Unknown', date: b.scheduled_date, completed_at: b.completed_at };
    });

    const now = new Date();
    const daysSince = (dateStr) => dateStr ? Math.floor((now - new Date(dateStr)) / (1000 * 60 * 60 * 24)) : 999;

    const prompt = `You are a property health analyst for INAYA Facilities Management in Dubai.

Property: ${property?.property_type || 'residential'}, ${property?.bedrooms || '?'} bedrooms, ${property?.area || 'Dubai'}
Active subscription: ${activeSubscription ? 'Yes' : 'No'}
Total completed services: ${completedBookings.length}
Service history (last 12 months): ${JSON.stringify(serviceHistory.slice(0, 20))}
Current month: ${now.toLocaleString('en', { month: 'long' })}

Calculate a Property Health Score (0-100) based on:
- Coverage of essential services (AC, cleaning, pest control, plumbing checks)
- Recency of services (more recent = healthier)
- Subscription coverage (adds 15 points if active)
- Seasonal readiness (Dubai summer: AC critical; winter: less critical)

Also provide:
- 2-3 specific maintenance alerts (overdue or due soon)
- 1 biggest risk (what could go wrong if ignored)
- Score breakdown by category`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number", description: "0-100 health score" },
          grade: { type: "string", description: "A, B, C, D, or F" },
          summary: { type: "string", description: "One sentence summary" },
          alerts: { type: "array", items: { type: "object", properties: { service: { type: "string" }, message: { type: "string" }, urgency: { type: "string", description: "high, medium, low" } } } },
          biggest_risk: { type: "string" },
          categories: { type: "array", items: { type: "object", properties: { name: { type: "string" }, score: { type: "number" }, status: { type: "string" } } } }
        }
      }
    });

    console.log(`Health score calculated: ${result.score} (${result.grade})`);
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('aiPropertyHealthScore error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});