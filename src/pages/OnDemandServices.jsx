import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, Clock, Star, Shield, Sparkles, Wrench, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OnDemandServices() {
  const [search, setSearch] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: () => base44.entities.ServiceCategory.list('display_order'),
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const all = await base44.entities.Service.list();
      return all.filter(s => s.is_active !== false);
    },
    initialData: []
  });

  const filtered = services.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const categoryIcons = {
    'soft-services': Sparkles,
    'hard-services': Wrench,
    'specialized-services': Settings
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-2xl">
            <Badge className="bg-white/20 text-white border-0 mb-4">On-Demand</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Book a Service Instantly</h1>
            <p className="text-lg text-emerald-100 mb-8">
              No subscriptions needed. Choose the service you need, pick a time, and we'll handle the rest. Professional technicians at your doorstep.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Same-day availability</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Vetted professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Satisfaction guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="relative max-w-md mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services (e.g. AC, plumbing, cleaning...)"
            className="pl-10 h-12 text-base"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg mb-2">No services found.</p>
            <p className="text-slate-400">Try a different search or <Link to={createPageUrl('Contact')} className="text-emerald-600 underline">contact us</Link> for custom requests.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(service => {
              const category = categories.find(c => c.id === service.category_id);
              const Icon = categoryIcons[category?.slug] || Sparkles;

              return (
                <Card key={service.id} className="group hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                  {service.image_url && (
                    <div className="h-44 overflow-hidden">
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  )}
                  <CardContent className={service.image_url ? 'pt-4' : 'pt-6'}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      {category && <span className="text-xs text-slate-500 font-medium">{category.name}</span>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>

                    {service.duration_minutes && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                        <Clock className="w-3 h-3" />
                        <span>~{service.duration_minutes} min</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <span className="text-2xl font-bold text-slate-900">AED {service.price}</span>
                        <span className="text-sm text-slate-400 ml-1">starting</span>
                      </div>
                      <Link to={createPageUrl('BookService') + '?service=' + service.id}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                          Book Now <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need Regular Maintenance?</h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Save up to 30% with our subscription packages. Get scheduled visits, priority booking, and dedicated technicians.
          </p>
          <Link to={createPageUrl('Subscriptions')}>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              View Subscription Packages <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}