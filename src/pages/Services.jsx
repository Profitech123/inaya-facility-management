import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Wrench, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { STATIC_CATEGORIES, STATIC_SERVICES } from '@/data/services';

export default function Services() {
  const { data: categories = [] } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: async () => { try { return await base44.entities.ServiceCategory.list('display_order'); } catch { return []; } },
    initialData: []
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => { try { return (await base44.entities.Service.list()).filter(s => s.is_active); } catch { return []; } },
    initialData: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;
  const displayServices = services.length > 0 ? services : STATIC_SERVICES;
  const filteredServices = selectedCategory === 'all' ? displayServices : displayServices.filter(s => s.category_id === selectedCategory);

  const categoryIcons = { 'soft-services': Sparkles, 'hard-services': Wrench, 'specialized-services': Settings, 'cat-soft-services': Sparkles, 'cat-hard-services': Wrench, 'cat-specialized-services': Settings };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Hero */}
      <div className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[hsl(160,60%,45%)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Our Services</p>
            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">Professional property <em className="text-[hsl(160,60%,45%)] not-italic">care</em></h1>
            <p className="text-white/50 text-lg max-w-xl leading-relaxed">
              Available on-demand or through subscription packages. Transparent pricing, vetted technicians, instant booking.
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-7">
        <div className="flex flex-wrap gap-2 bg-white rounded-2xl border border-[hsl(40,10%,90%)] p-2 shadow-xl shadow-black/[0.03] w-fit">
          <button onClick={() => setSelectedCategory('all')} className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${selectedCategory === 'all' ? 'bg-[hsl(210,20%,6%)] text-white' : 'text-[hsl(210,10%,45%)] hover:bg-[hsl(40,15%,96%)]'}`}>
            All Services
          </button>
          {displayCategories.slice(0, 3).map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${selectedCategory === cat.id ? 'bg-[hsl(210,20%,6%)] text-white' : 'text-[hsl(210,10%,45%)] hover:bg-[hsl(40,15%,96%)]'}`}>
              {cat.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const category = displayCategories.find(c => c.id === service.category_id);
            const Icon = categoryIcons[category?.slug] || categoryIcons[category?.id] || Sparkles;
            return (
              <div key={service.id} className="group bg-white rounded-2xl border border-[hsl(40,10%,90%)] overflow-hidden hover:shadow-xl hover:shadow-black/[0.05] hover:border-[hsl(160,60%,38%)]/20 transition-all duration-300">
                {service.image_url && (
                  <div className="w-full h-52 overflow-hidden">
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[hsl(210,20%,10%)]">{service.name}</h3>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(160,60%,38%,0.08)' }}>
                      <Icon className="w-4 h-4 text-[hsl(160,60%,38%)]" />
                    </div>
                  </div>
                  {category && (
                    <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-[hsl(210,10%,45%)] bg-[hsl(40,15%,96%)] mb-3">{category.name}</span>
                  )}
                  <p className="text-sm text-[hsl(210,10%,55%)] mb-4 leading-relaxed">{service.description}</p>
                  {service.features?.length > 0 && (
                    <ul className="space-y-1.5 mb-5">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs text-[hsl(210,10%,45%)] flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[hsl(160,60%,38%)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-5 border-t border-[hsl(40,10%,92%)]">
                    <div>
                      <div className="text-2xl font-bold text-[hsl(210,20%,10%)]">AED {service.price}</div>
                      <div className="text-[10px] text-[hsl(210,10%,55%)] uppercase tracking-wider">Starting from</div>
                    </div>
                    <Link to={createPageUrl('BookService') + '?service=' + service.id}>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                        Book <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
