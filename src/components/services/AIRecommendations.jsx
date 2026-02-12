import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIRecommendations({ allServices = [], categories = [] }) {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookingsForRec', user?.id],
    queryFn: async () => {
      const all = await base44.entities.Booking.list('-created_date', 50);
      return all.filter(b => b.customer_id === user.id);
    },
    enabled: !!user?.id,
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['userSubsForRec', user?.id],
    queryFn: async () => {
      const all = await base44.entities.Subscription.list();
      return all.filter(s => s.customer_id === user.id);
    },
    enabled: !!user?.id,
    initialData: []
  });

  useEffect(() => {
    if (allServices.length === 0) return;
    generateRecommendations();
  }, [allServices, bookings, subscriptions, user]);

  const generateRecommendations = async () => {
    setLoading(true);

    const serviceList = allServices.map(s => ({
      id: s.id,
      name: s.name,
      category: categories.find(c => c.id === s.category_id)?.name || '',
      price: s.price,
      description: s.description?.slice(0, 100)
    }));

    const bookedServiceNames = bookings
      .map(b => allServices.find(s => s.id === b.service_id)?.name)
      .filter(Boolean);

    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const isLoggedIn = !!user;

    const prompt = `You are a facilities management AI recommendation engine for INAYA in Dubai, UAE.

Available services: ${JSON.stringify(serviceList)}

${isLoggedIn ? `User info:
- Past bookings: ${bookedServiceNames.length > 0 ? bookedServiceNames.join(', ') : 'None yet'}
- Has subscription: ${subscriptions.length > 0 ? 'Yes' : 'No'}` : 'User is not logged in (anonymous visitor).'}

Current month: ${currentMonth}
Weather context: Dubai climate — consider seasonal needs (AC heavy in summer, outdoor maintenance in cooler months).

Recommend exactly 3 services from the available list. For logged-in users with bookings, recommend complementary services. For new or anonymous users, recommend the most popular/seasonal services.

For each recommendation, provide a short personalized reason (1 sentence, max 15 words).
Also provide one overall tip (1 sentence, max 20 words).`;

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
            tip: { type: "string" }
          }
        }
      });

      const recs = (res.recommendations || [])
        .map(r => ({
          ...r,
          service: allServices.find(s => s.id === r.service_id)
        }))
        .filter(r => r.service);

      setRecommendations({ items: recs, tip: res.tip });
    } catch {
      setRecommendations(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
        </div>
        <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Finding the best services for you...
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.items.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
            {recommendations.tip && (
              <p className="text-xs text-slate-500 mt-0.5">{recommendations.tip}</p>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs gap-1">
          <Sparkles className="w-3 h-3" /> AI Powered
        </Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {recommendations.items.map((rec, idx) => {
          const service = rec.service;
          const category = categories.find(c => c.id === service.category_id);

          return (
            <Card key={idx} className="relative overflow-hidden border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              {service.image_url && (
                <div className="h-32 overflow-hidden">
                  <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
              )}
              <CardContent className={`${service.image_url ? 'pt-3' : 'pt-5'} pb-4`}>
                {category && <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">{category.name}</span>}
                <h3 className="font-bold text-slate-900 mt-1 mb-1">{service.name}</h3>
                <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1 mb-3 italic">
                  "{rec.reason}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">AED {service.price}</span>
                  <Link to={createPageUrl('BookService') + '?service=' + service.id}>
                    <Button size="sm" variant="outline" className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-1">
                      Book <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}