import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Package, ArrowRight, Percent } from 'lucide-react';

export default function AIBundleRecommendations({ services, categories, bookings }) {
  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setBundles(null);

    const recentBookings = (bookings || []).slice(0, 200);

    // Find co-occurrence patterns
    const customerServices = {};
    recentBookings.forEach(b => {
      if (!customerServices[b.customer_id]) customerServices[b.customer_id] = new Set();
      customerServices[b.customer_id].add(b.service_id);
    });

    const servicesSummary = services
      .filter(s => s.is_active !== false)
      .map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        category: categories.find(c => c.id === s.category_id)?.name || 'Unknown',
      }));

    const cooccurrenceData = Object.values(customerServices)
      .filter(set => set.size > 1)
      .map(set => Array.from(set))
      .slice(0, 50);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI product strategist for INAYA Facilities Management in Dubai, UAE.

Available services:
${JSON.stringify(servicesSummary, null, 2)}

Customer co-booking patterns (services frequently booked by the same customer):
${JSON.stringify(cooccurrenceData.slice(0, 20))}

Total customers with multiple bookings: ${cooccurrenceData.length}
Current month: ${new Date().toLocaleDateString('en', { month: 'long' })}

Based on this data, suggest 4 service bundles/packages that would appeal to customers:
1. Consider which services naturally complement each other
2. Consider seasonal relevance for Dubai (summer AC-heavy, winter outdoor maintenance)
3. Consider property types (villa vs apartment)
4. Suggest attractive bundle discounts (10-25%)

For each bundle, provide a catchy name, included services, target customer, suggested price with discount, and a compelling marketing description.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: { type: "string", description: "Key data insights used for recommendations" },
          bundles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string", description: "Marketing description" },
                target_audience: { type: "string" },
                property_type: { type: "string", description: "villa, apartment, or all" },
                service_ids: { type: "array", items: { type: "string" } },
                service_names: { type: "array", items: { type: "string" } },
                individual_total: { type: "number" },
                bundle_price: { type: "number" },
                discount_percent: { type: "number" },
                seasonal_relevance: { type: "string", description: "high, medium, low" },
                frequency_suggestion: { type: "string", description: "e.g. monthly, quarterly" }
              }
            }
          }
        }
      }
    });

    setBundles(res);
    setLoading(false);
  };

  const seasonColors = {
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-500'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="w-5 h-5 text-indigo-500" />
            AI Bundle Recommendations
          </CardTitle>
          <Button
            size="sm"
            onClick={analyze}
            disabled={loading}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'Analyzing patterns...' : 'Generate Bundles'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!bundles && !loading && (
          <div className="text-center py-8 text-sm text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Click "Generate Bundles" to get AI-powered package recommendations based on customer booking patterns and service complementarity.
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Analyzing booking patterns & service synergies...</p>
          </div>
        )}

        {bundles && (
          <div className="space-y-4">
            {/* Insights */}
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-xs font-medium text-indigo-600 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Data Insights
              </div>
              <p className="text-sm text-slate-700">{bundles.insights}</p>
            </div>

            {/* Bundle cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {(bundles.bundles || []).map((bundle, i) => (
                <div key={i} className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{bundle.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{bundle.target_audience}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={`text-[9px] ${seasonColors[bundle.seasonal_relevance] || seasonColors.medium}`}>
                        {bundle.seasonal_relevance} season
                      </Badge>
                      {bundle.property_type && bundle.property_type !== 'all' && (
                        <Badge variant="outline" className="text-[9px] capitalize">{bundle.property_type}</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">{bundle.description}</p>

                  {/* Included services */}
                  <div className="space-y-1 mb-4">
                    <div className="text-xs font-medium text-slate-500 mb-1">Included Services</div>
                    {(bundle.service_names || []).map((name, j) => (
                      <div key={j} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-400" />
                        {name}
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-end justify-between pt-3 border-t">
                    <div>
                      <div className="text-xs text-slate-400 line-through">AED {bundle.individual_total}</div>
                      <div className="text-xl font-bold text-indigo-700">AED {bundle.bundle_price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                        <Percent className="w-3 h-3" />
                        Save {Math.round(bundle.discount_percent)}%
                      </Badge>
                    </div>
                  </div>

                  {bundle.frequency_suggestion && (
                    <div className="text-[11px] text-slate-400 mt-2 italic">
                      Recommended: {bundle.frequency_suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              These bundle suggestions are based on AI analysis of booking patterns and service synergies. Create them as subscription packages from the Packages management page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}