import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIServiceRecommendation({ user, currentServiceId, selectedProperty }) {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !selectedProperty) return;
    generate();
  }, [user, selectedProperty, currentServiceId]);

  const generate = async () => {
    setLoading(true);
    try {
      const [allServices, bookings] = await Promise.all([
        base44.entities.Service.list(),
        base44.entities.Booking.list('-created_date', 30).then(all => all.filter(b => b.customer_id === user.id)),
      ]);

      const activeServices = allServices.filter(s => s.is_active !== false && s.id !== currentServiceId);
      const bookedNames = bookings.map(b => allServices.find(s => s.id === b.service_id)?.name).filter(Boolean);

      const prompt = `You are an AI for INAYA Facilities Management in Dubai.

Property: ${selectedProperty.property_type}, ${selectedProperty.bedrooms || '?'} bedrooms, area: ${selectedProperty.area || selectedProperty.address}
Past services booked: ${bookedNames.length > 0 ? bookedNames.join(', ') : 'None'}
Currently booking: ${allServices.find(s => s.id === currentServiceId)?.name || 'Unknown'}
Month: ${new Date().toLocaleDateString('en', { month: 'long' })}

Available services: ${activeServices.slice(0, 15).map(s => `${s.id}|${s.name}|AED ${s.price}`).join('; ')}

Suggest 2 complementary services they should also book. Keep reasons under 10 words each.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service_id: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      const items = (res.suggestions || [])
        .map(r => ({ ...r, service: activeServices.find(s => s.id === r.service_id) }))
        .filter(r => r.service);

      setRecs(items);
    } catch {
      setRecs(null);
    }
    setLoading(false);
  };

  if (!selectedProperty || loading) {
    if (loading) {
      return (
        <div className="flex items-center gap-2 py-3 text-sm text-amber-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Finding complementary services...</span>
        </div>
      );
    }
    return null;
  }

  if (!recs || recs.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-semibold text-slate-800">Also recommended for your {selectedProperty.property_type}</span>
        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">AI</Badge>
      </div>
      <div className="space-y-2">
        {recs.map((rec, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-100">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900">{rec.service.name}</div>
              <div className="text-xs text-amber-700 italic">"{rec.reason}"</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-slate-700">AED {rec.service.price}</span>
              <Link to={createPageUrl('BookService') + '?service=' + rec.service.id}>
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  Book <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}