import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Clock, Check, Sparkles, Wrench, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons = {
  'soft-services': Sparkles,
  'hard-services': Wrench,
  'specialized-services': Settings
};

export default function ServiceSelectionStep({ selectedServiceId, onSelectService, onNext }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: categories = [] } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: () => base44.entities.ServiceCategory.list('display_order'),
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['allActiveServices'],
    queryFn: async () => {
      const all = await base44.entities.Service.list();
      return all.filter(s => s.is_active !== false);
    },
    initialData: []
  });

  const filtered = services.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || s.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Service</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services (AC, plumbing, cleaning...)"
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              selectedCategory === 'all'
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
            )}
          >
            All Services
          </button>
          {categories.map(cat => {
            const Icon = categoryIcons[cat.slug] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                )}
              >
                <Icon className="w-3 h-3" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Service Grid */}
        <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map(service => {
            const isSelected = selectedServiceId === service.id;
            const category = categories.find(c => c.id === service.category_id);
            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className={cn(
                  "relative p-4 rounded-xl text-left border-2 transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {service.image_url && (
                  <div className="h-24 rounded-lg overflow-hidden mb-3 -mx-1 -mt-1">
                    <img src={service.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-xs text-slate-400 mb-1">{category?.name}</div>
                <div className="font-semibold text-slate-900 text-sm">{service.name}</div>
                {service.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-bold text-emerald-700">AED {service.price}</span>
                  {service.duration_minutes && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> ~{service.duration_minutes} min
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            No services found matching your search.
          </div>
        )}

        {/* Selected summary + Continue */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {selectedService ? (
              <div className="text-sm">
                <span className="text-slate-500">Selected: </span>
                <span className="font-semibold text-slate-900">{selectedService.name}</span>
                <span className="text-emerald-600 font-bold ml-2">AED {selectedService.price}</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400">Select a service to continue</span>
            )}
          </div>
          <Button
            onClick={onNext}
            disabled={!selectedServiceId}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}