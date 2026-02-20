import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Search, Clock, Star, Shield, Sparkles, Wrench, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIRecommendations from '../components/services/AIRecommendations';
import { STATIC_CATEGORIES, STATIC_SERVICES } from '@/data/services';

export default function OnDemandServices() {
  const [search, setSearch] = useState('');

  const { data: categories = [] } = useQuery({ queryKey: ['serviceCategories'], queryFn: () => base44.entities.ServiceCategory.list('display_order'), initialData: [] });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: async () => (await base44.entities.Service.list()).filter(s => s.is_active !== false), initialData: [] });

  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;
  const displayServices = services.length > 0 ? services : STATIC_SERVICES;
  const filtered = displayServices.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()));
  const categoryIcons = { 'soft-services': Sparkles, 'hard-services': Wrench, 'specialized-services': Settings, 'cat-soft-services': Sparkles, 'cat-hard-services': Wrench, 'cat-specialized-services': Settings };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Hero */}
      <div className="relative py-24 lg:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,25%))' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wider uppercase mb-6">On-Demand</span>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-5 leading-tight">Book a service <em className="not-italic opacity-80">instantly</em></h1>
            <p className="text-white/70 text-lg mb-10 leading-relaxed">No subscriptions needed. Choose the service you need, pick a time, and we will handle the rest.</p>
            <div className="flex flex-wrap gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Same-day availability</span></div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4" /><span>Vetted professionals</span></div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>Satisfaction guaranteed</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="relative max-w-lg mb-10 -mt-18">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(210,10%,65%)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services (e.g. AC, plumbing, cleaning...)"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[hsl(40,10%,88%)] text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent bg-white shadow-xl shadow-black/[0.05] transition-all"
          />
        </div>

        <AIRecommendations allServices={displayServices} categories={displayCategories} />

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[hsl(210,10%,45%)] text-lg mb-2">No services found.</p>
            <p className="text-[hsl(210,10%,55%)]">Try a different search or <Link to={createPageUrl('Contact')} className="text-[hsl(160,60%,38%)] underline">contact us</Link>.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(service => {
              const category = displayCategories.find(c => c.id === service.category_id);
              const Icon = categoryIcons[category?.slug] || categoryIcons[category?.id] || Sparkles;
              return (
                <div key={service.id} className="group bg-white rounded-2xl border border-[hsl(40,10%,90%)] overflow-hidden hover:shadow-xl hover:shadow-black/[0.05] hover:border-[hsl(160,60%,38%)]/20 transition-all duration-300">
                  {service.image_url && (
                    <div className="h-44 overflow-hidden">
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-[hsl(160,60%,38%)]" />
                      {category && <span className="text-[10px] text-[hsl(210,10%,55%)] font-semibold uppercase tracking-wider">{category.name}</span>}
                    </div>
                    <h3 className="text-lg font-semibold text-[hsl(210,20%,10%)] mb-2">{service.name}</h3>
                    <p className="text-sm text-[hsl(210,10%,55%)] mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                    {service.duration_minutes && (
                      <div className="flex items-center gap-1 text-xs text-[hsl(210,10%,55%)] mb-4">
                        <Clock className="w-3 h-3" />~{service.duration_minutes} min
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-[hsl(40,10%,92%)]">
                      <div>
                        <span className="text-xl font-bold text-[hsl(210,20%,10%)]">AED {service.price}</span>
                        <span className="text-[10px] text-[hsl(210,10%,55%)] ml-1 uppercase tracking-wider">starting</span>
                      </div>
                      <Link to={createPageUrl('BookService') + '?service=' + service.id}>
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                          Book <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl p-8 lg:p-12 text-center" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
          <h2 className="text-2xl font-serif font-bold text-white mb-3">Need regular maintenance?</h2>
          <p className="text-white/40 text-sm mb-8 max-w-lg mx-auto">Save up to 30% with our subscription packages. Get scheduled visits, priority booking, and dedicated technicians.</p>
          <Link to={createPageUrl('Subscriptions')}>
            <button className="flex items-center gap-2 px-8 py-3.5 mx-auto rounded-full text-sm font-semibold text-white transition-all hover:shadow-xl" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
              View Packages <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
