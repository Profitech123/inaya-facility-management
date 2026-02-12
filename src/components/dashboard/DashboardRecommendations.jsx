import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DashboardRecommendations({ user, bookings = [] }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: services = [] } = useQuery({
    queryKey: ['allServicesForDashRec'],
    queryFn: async () => {
      const all = await base44.entities.Service.list();
      return all.filter(s => s.is_active !== false);
    },
    initialData: []
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesForDashRec'],
    queryFn: () => base44.entities.ServiceCategory.list('display_order'),
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subsForDashRec', user?.id],
    queryFn: async () => {
      const all = await base44.entities.Subscription.list();
      return all.filter(s => s.customer_id === user.id);
    },
    enabled: !!user?.id,
    initialData: []
  });

  useEffect(() => {
    if (services.length === 0 || !user) return;
    generate();
  }, [services, bookings, subscriptions, user]);

  const generate = async () => {
    setLoading(true);
    const serviceList = services.map(s => ({
      id: s.id,
      name: s.name,
      category: categories.find(c => c.id === s.category_id)?.name || '',
      price: s.price
    }));

    const bookedServiceNames = bookings
      .map(b => services.find(s => s.id === b.service_id)?.name)
      .filter(Boolean);

    const prompt = `You are a facilities management AI for INAYA in Dubai.

Available services: ${JSON.stringify(serviceList)}

User profile:
- Name: ${user.full_name || 'Customer'}
- Past bookings: ${bookedServiceNames.length > 0 ? bookedServiceNames.join(', ') : 'None yet'}
- Has active subscription: ${subscriptions.some(s => s.status === 'active') ? 'Yes' : 'No'}
- Current month: ${new Date().toLocaleString('en', { month: 'long' })}

Recommend exactly 2 services they haven't recently booked. Give a short personalized reason (max 12 words each). Also suggest whether they should consider a subscription package (yes/no with 1-sentence reason).`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  service_id: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            suggest_subscription: { type: "boolean" },
            subscription_reason: { type: "string" }
          }
        }
      });

      const recs = (res.recommendations || [])
        .map(r => ({ ...r, service: services.find(s => s.id === r.service_id) }))
        .filter(r => r.service);

      setRecommendations({
        items: recs,
        suggestSub: res.suggest_subscription,
        subReason: res.subscription_reason
      });
    } catch {
      setRecommendations(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="border-amber-100">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-sm text-slate-900">Smart Suggestions</span>
            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50 ml-auto">AI</Badge>
          </div>
          <div className="flex items-center justify-center py-4 text-slate-400 gap-2 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" /> Analyzing your profile...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.items.length === 0) return null;

  return (
    <Card className="border-amber-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <CardContent className="py-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-sm text-slate-900">Recommended For You</span>
          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50 ml-auto gap-1">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </Badge>
        </div>

        <div className="space-y-3">
          {recommendations.items.map((rec, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
              {rec.service.image_url ? (
                <img src={rec.service.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900">{rec.service.name}</div>
                <div className="text-xs text-amber-700 italic">"{rec.reason}"</div>
              </div>
              <Link to={createPageUrl('BookService') + '?service=' + rec.service.id}>
                <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 gap-1 text-xs flex-shrink-0">
                  Book <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {recommendations.suggestSub && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-800 mb-2">{recommendations.subReason}</p>
            <Link to={createPageUrl('Subscriptions')}>
              <Button size="sm" variant="outline" className="text-xs border-emerald-200 text-emerald-700 gap-1">
                View Packages <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}