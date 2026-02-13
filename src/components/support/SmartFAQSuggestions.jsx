import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Loader2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// All FAQ entries for matching
const FAQ_ENTRIES = [
  { q: "What is INAYA Facilities Management?", a: "INAYA is a leading facilities management company based in Dubai, part of the Belhasa Group. We provide comprehensive hard and soft services including AC maintenance, plumbing, electrical, cleaning, pest control, landscaping, and more.", category: "General" },
  { q: "What areas in the UAE do you serve?", a: "We primarily serve Dubai and Abu Dhabi, with coverage across major communities including Dubai Marina, JBR, Downtown Dubai, Palm Jumeirah, Arabian Ranches, JVC, and many more.", category: "General" },
  { q: "Are your technicians certified and vetted?", a: "Yes. All our technicians are fully certified, background-checked, and undergo rigorous training.", category: "General" },
  { q: "Do you offer emergency services?", a: "Yes, we operate a 24/7 customer service contact centre. For emergencies, call our toll-free number 6005-INAYA.", category: "General" },
  { q: "How do I book an on-demand service?", a: "Browse our Services page, select the service you need, choose your property and preferred time slot, and confirm your booking.", category: "On-Demand" },
  { q: "How soon can a technician arrive?", a: "We offer same-day availability for most services. A technician can typically be at your property within a few hours.", category: "On-Demand" },
  { q: "Can I reschedule or cancel a booking?", a: "Yes, you can reschedule or cancel through your dashboard. We ask for at least 4 hours notice.", category: "On-Demand" },
  { q: "What payment methods do you accept?", a: "We accept credit/debit cards (Visa, Mastercard), bank transfers, and cash upon request.", category: "On-Demand" },
  { q: "What subscription packages do you offer?", a: "We offer Essential, Silver, and Gold packages tailored to different property sizes and needs at discounted rates.", category: "Subscriptions" },
  { q: "Can I customise my subscription package?", a: "Yes! Our custom package builder lets you choose specific services, frequencies, and schedules.", category: "Subscriptions" },
  { q: "How do I cancel or pause my subscription?", a: "Manage your subscription from your dashboard. Cancellations require 30 days notice. You can also pause temporarily.", category: "Subscriptions" },
  { q: "Is there a minimum contract duration?", a: "Packages come in 3, 6, or 12-month durations. Longer commitments offer greater discounts.", category: "Subscriptions" },
  { q: "How do I create an account?", a: "Click 'Create Account' in the top navigation, enter your details, and verify your email.", category: "Account" },
  { q: "How can I track my service requests?", a: "Go to your Dashboard to see all upcoming and past bookings, their status, and assigned technician details.", category: "Account" },
  { q: "How do I add or manage my properties?", a: "Go to 'My Properties' in your dashboard to add new properties or update existing ones.", category: "Account" },
  { q: "Who do I contact for billing issues?", a: "Create a support ticket under 'Billing' category or call +971 4 815 7300.", category: "Account" },
];

export default function SmartFAQSuggestions({ subject, description }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef('');

  const query = `${subject} ${description}`.trim();

  useEffect(() => {
    if (dismissed) return;
    if (query.length < 10) {
      setSuggestions([]);
      return;
    }

    // Avoid duplicate calls for same input
    if (query === lastQueryRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      lastQueryRef.current = query;
      setLoading(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a support assistant for INAYA Facilities Management in Dubai. A customer is writing a support query.

Their input so far: "${query}"

Here is the FAQ knowledge base:
${FAQ_ENTRIES.map((f, i) => `[${i}] Q: ${f.q}\nA: ${f.a}`).join('\n\n')}

Return the indices of the TOP 3 most relevant FAQ entries that might answer their question. Only include genuinely relevant ones. If none are relevant, return an empty array.

Also provide a brief one-line helpful tip if applicable.`,
        response_json_schema: {
          type: "object",
          properties: {
            relevant_indices: { type: "array", items: { type: "number" } },
            tip: { type: "string" }
          }
        }
      });

      const indices = (result.relevant_indices || []).slice(0, 3);
      const matched = indices.map(i => FAQ_ENTRIES[i]).filter(Boolean);
      setSuggestions({ items: matched, tip: result.tip || '' });
      setLoading(false);
    }, 1200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, dismissed]);

  if (dismissed || (!loading && (!suggestions?.items || suggestions.items.length === 0))) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-700">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-semibold">These might help</span>
              </div>
              <div className="flex items-center gap-2">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
                <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {suggestions?.tip && (
              <p className="text-xs text-amber-600 mb-2 italic">{suggestions.tip}</p>
            )}

            <div className="space-y-1.5">
              {(suggestions?.items || []).map((faq, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-amber-100">
                  <button
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-amber-50/50 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-800">{faq.q}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${expandedIdx === idx ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedIdx === idx && (
                    <div className="px-3 pb-2.5">
                      <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}