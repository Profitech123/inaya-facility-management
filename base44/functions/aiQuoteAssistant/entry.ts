import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description, property_type, bedrooms, area } = await req.json();

    if (!description) return Response.json({ error: 'description required' }, { status: 400 });

    console.log(`AI Quote: "${description}"`);

    const services = await base44.asServiceRole.entities.Service.list().then(all => all.filter(s => s.is_active !== false));

    const serviceList = services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration_minutes: s.duration_minutes,
      description: s.description
    }));

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an AI quote assistant for INAYA Facilities Management in Dubai.

Customer described their issue: "${description}"
Property: ${property_type || 'not specified'}, ${bedrooms || '?'} bedrooms, ${area || 'Dubai'}

Available services with prices (AED):
${JSON.stringify(serviceList, null, 2)}

Analyze the description and:
1. Identify what services are needed (match to available services)
2. Estimate total cost range
3. Estimate time to complete
4. Urgency level
5. Write a friendly 1-sentence explanation of what the issue likely is
6. Suggest whether a subscription would save money long-term`,
      response_json_schema: {
        type: "object",
        properties: {
          matched_services: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service_id: { type: "string" },
                service_name: { type: "string" },
                estimated_price: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          total_min: { type: "number" },
          total_max: { type: "number" },
          estimated_duration_hours: { type: "number" },
          urgency: { type: "string", description: "immediate, within_week, routine" },
          diagnosis: { type: "string", description: "Friendly 1-sentence explanation" },
          suggest_subscription: { type: "boolean" },
          subscription_reason: { type: "string" }
        }
      }
    });

    console.log(`Quote generated: AED ${result.total_min}-${result.total_max}, urgency: ${result.urgency}`);
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('aiQuoteAssistant error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});