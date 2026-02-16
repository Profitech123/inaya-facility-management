import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

export default function AIDynamicPricing({ services, categories, bookings, providers }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setSuggestions(null);

    // Build context data
    const now = new Date();
    const currentMonth = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });
    const recentBookings = (bookings || []).slice(0, 200);

    // Count bookings per service
    const serviceDemand = {};
    recentBookings.forEach(b => {
      serviceDemand[b.service_id] = (serviceDemand[b.service_id] || 0) + 1;
    });

    // Provider availability
    const activeProviders = (providers || []).filter(p => p.is_active);
    const busyProviders = new Set();
    recentBookings
      .filter(b => ['confirmed', 'en_route', 'in_progress'].includes(b.status))
      .forEach(b => { if (b.assigned_provider_id) busyProviders.add(b.assigned_provider_id); });

    const servicesSummary = services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      category: categories.find(c => c.id === s.category_id)?.name || 'Unknown',
      bookings_count: serviceDemand[s.id] || 0,
    }));

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI pricing strategist for INAYA Facilities Management in Dubai, UAE.

Current date: ${currentMonth}
Dubai climate context: Consider UAE seasonality — summer (Jun-Sep) is extremely hot with peak AC demand, winter (Nov-Feb) is mild with more outdoor maintenance.
Total active technicians: ${activeProviders.length}
Currently busy technicians: ${busyProviders.size}
Total recent bookings: ${recentBookings.length}

Services data:
${JSON.stringify(servicesSummary, null, 2)}

For each service, suggest an optimized price considering:
1. Current demand (booking volume relative to others)
2. Seasonality for Dubai/UAE (current month: ${now.toLocaleDateString('en', { month: 'long' })})
3. Technician availability and capacity utilization
4. Competitive positioning for a premium FM company

Return suggestions for the top 8 most impactful services. Include reasoning.`,
      response_json_schema: {
        type: "object",
        properties: {
          market_context: { type: "string", description: "Brief market conditions summary" },
          capacity_utilization: { type: "string", description: "Current capacity assessment" },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service_id: { type: "string" },
                service_name: { type: "string" },
                current_price: { type: "number" },
                suggested_price: { type: "number" },
                change_percent: { type: "number" },
                demand_level: { type: "string", description: "high, medium, low" },
                reasoning: { type: "string" }
              }
            }
          }
        }
      }
    });

    setSuggestions(res);
    setLoading(false);
  };

  const demandColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700'
  };

  const PriceChangeIcon = ({ pct }) => {
    if (pct > 1) return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (pct < -1) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-amber-500" />
            AI Dynamic Pricing
          </CardTitle>
          <Button
            size="sm"
            onClick={analyze}
            disabled={loading}
            className="gap-1.5 bg-amber-600 hover:bg-amber-700"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {loading ? 'Analyzing market...' : 'Generate Suggestions'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!suggestions && !loading && (
          <div className="text-center py-8 text-sm text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Click "Generate Suggestions" to get AI-powered pricing recommendations based on demand, seasonality, and technician availability.
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Analyzing demand patterns, seasonality & capacity...</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-4">
            {/* Market context */}
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-xs font-medium text-slate-500 mb-1">Market Context</div>
              <p className="text-sm text-slate-700">{suggestions.market_context}</p>
              <p className="text-xs text-slate-500 mt-1">{suggestions.capacity_utilization}</p>
            </div>

            {/* Price suggestions table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-xs font-medium text-slate-500 border-b">
                <div className="col-span-3">Service</div>
                <div className="col-span-1 text-center">Demand</div>
                <div className="col-span-2 text-right">Current</div>
                <div className="col-span-2 text-right">Suggested</div>
                <div className="col-span-1 text-center">Change</div>
                <div className="col-span-3">Reasoning</div>
              </div>
              {(suggestions.suggestions || []).map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-0 items-center text-sm hover:bg-slate-50/50">
                  <div className="col-span-3 font-medium text-slate-900 truncate">{s.service_name}</div>
                  <div className="col-span-1 text-center">
                    <Badge className={`text-[9px] px-1.5 ${demandColors[s.demand_level] || demandColors.medium}`}>
                      {s.demand_level}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-right text-slate-600">AED {s.current_price}</div>
                  <div className="col-span-2 text-right font-semibold text-slate-900">AED {s.suggested_price}</div>
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <PriceChangeIcon pct={s.change_percent} />
                    <span className={`text-xs font-medium ${s.change_percent > 0 ? 'text-emerald-600' : s.change_percent < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {s.change_percent > 0 ? '+' : ''}{Math.round(s.change_percent)}%
                    </span>
                  </div>
                  <div className="col-span-3 text-xs text-slate-500 line-clamp-2">{s.reasoning}</div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              These are AI-generated suggestions. Review carefully before updating prices. Changes can be applied individually from each service's edit form.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}