import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TechnicianSelector({ serviceId, selectedProviderId, onChange }) {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const all = await base44.entities.Provider.list();
      return all.filter(p => p.is_active);
    },
    initialData: []
  });

  // Filter providers whose specialization includes related service keywords
  const { data: service } = useQuery({
    queryKey: ['service-for-tech', serviceId],
    queryFn: async () => {
      const services = await base44.entities.Service.list();
      return services.find(s => s.id === serviceId);
    },
    enabled: !!serviceId
  });

  const { data: category } = useQuery({
    queryKey: ['category-for-tech', service?.category_id],
    queryFn: async () => {
      const cats = await base44.entities.ServiceCategory.list();
      return cats.find(c => c.id === service.category_id);
    },
    enabled: !!service?.category_id
  });

  // Match providers whose specialization array overlaps with the category name
  const relevantProviders = providers.filter(p => {
    if (!p.specialization || p.specialization.length === 0) return true; // generalist
    if (!category) return true;
    return p.specialization.some(s =>
      s.toLowerCase().includes(category.name?.toLowerCase?.() || '') ||
      category.name?.toLowerCase?.()?.includes(s.toLowerCase())
    );
  });

  if (isLoading) {
    return <div className="text-sm text-slate-400">Loading technicians...</div>;
  }

  if (relevantProviders.length === 0) {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Technician</label>
      <p className="text-xs text-slate-400 mb-3">Optional — we'll assign the best available if you skip this</p>
      <div className="space-y-2">
        {/* No preference option */}
        <button
          onClick={() => onChange('')}
          className={cn(
            "w-full p-3 rounded-xl text-left text-sm transition-all border-2 flex items-center gap-3",
            !selectedProviderId
              ? "bg-emerald-50 text-emerald-700 border-emerald-500"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <div className="font-medium">No preference</div>
            <div className="text-xs text-slate-400">Auto-assign best available</div>
          </div>
        </button>

        {relevantProviders.map(provider => {
          const selected = selectedProviderId === provider.id;
          return (
            <button
              key={provider.id}
              onClick={() => onChange(provider.id)}
              className={cn(
                "w-full p-3 rounded-xl text-left text-sm transition-all border-2 flex items-center gap-3",
                selected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {provider.profile_image ? (
                  <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{provider.full_name}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {provider.average_rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {provider.average_rating.toFixed(1)}
                    </span>
                  )}
                  {provider.total_jobs_completed > 0 && (
                    <span>{provider.total_jobs_completed} jobs</span>
                  )}
                </div>
              </div>
              {selected && (
                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}