import { base44 } from '@/api/base44Client';

/**
 * AI auto-categorization and prioritization for support tickets.
 * Call this after the user fills in subject + description, before saving.
 * Returns { category, priority, reasoning }.
 */
export async function classifyTicket(subject, description) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a support ticket triage system for INAYA Facilities Management (Dubai-based property maintenance company).

Analyze this support ticket and classify it:

Subject: "${subject}"
Description: "${description}"

Categories (pick one):
- billing: Payment issues, invoices, refunds, charges
- service_quality: Complaints about work done, technician behavior, results
- scheduling: Rescheduling, cancellations, timing issues, availability
- technical: App/website issues, account problems, login issues
- general: Everything else

Priority levels (pick one):
- urgent: Safety hazards, water leaks, electrical dangers, gas leaks, security issues, or service completely unusable
- high: Service not working but not dangerous, payment overcharged, missed appointments, time-sensitive
- medium: General complaints, quality concerns, scheduling requests
- low: Feature requests, general inquiries, feedback, minor issues

Be accurate. Default to medium if unclear. Only use urgent for genuinely dangerous or critical situations.`,
    response_json_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["billing", "service_quality", "scheduling", "technical", "general"] },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        reasoning: { type: "string" }
      }
    }
  });

  return {
    category: result.category || 'general',
    priority: result.priority || 'medium',
    reasoning: result.reasoning || ''
  };
}