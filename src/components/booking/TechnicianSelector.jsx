import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isSameDay, format } from 'date-fns';

export default function TechnicianSelector({ serviceId, selectedProviderId, onChange, selectedDate, selectedTimeSlot, allBookings = [] }) {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const all = await base44.entities.Provider.list();
      return all.filter(p => p.is_active);
    },
    initialData: []
  });

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

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-for-tech'],
    queryFn: () => base44.entities.ProviderReview.list(),
    initialData: []
  });

  // Match providers whose specialization array overlaps with the category name
  const relevantProviders = providers.filter(p => {
    if (!p.specialization || p.specialization.length === 0) return true;
    if (!category) return true;
    return p.specialization.some(s =>
      s.toLowerCase().includes(category.name?.toLowerCase?.() || '') ||
      category.name?.toLowerCase?.()?.includes(s.toLowerCase())
    );
  });

  // Compute availability for each provider on the selected date/time
  const providerAvailability = useMemo(() => {
    const map = {};
    relevantProviders.forEach(p => {
      const provBookings = allBookings.filter(b =>
        b.assigned_provider_id === p.id &&
        b.status !== 'cancelled'
      );

      // Bookings on selected date
      const dayBookings = selectedDate
        ? provBookings.filter(b => b.scheduled_date && isSameDay(new Date(b.scheduled_date), selectedDate))
        : [];

      // Is the specific slot taken?
      const slotTaken = selectedTimeSlot
        ? dayBookings.some(b => b.scheduled_time === selectedTimeSlot)
        : false;

      const dayCount = dayBookings.length;

      // Get recent reviews for this provider
      const provReviews = reviews.filter(r => r.provider_id === p.id);
      const avgRating = provReviews.length > 0
        ? provReviews.reduce((s, r) => s + r.rating, 0) / provReviews.length
        : p.average_rating || 0;

      map[p.id] = {
        slotTaken,
        dayCount,
        available: !slotTaken,
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: provReviews.length,
        totalJobs: p.total_jobs_completed || 0,
      };
    });
    return map;
  }, [relevantProviders, allBookings, selectedDate, selectedTimeSlot, reviews]);

  // Sort: available first, then by rating
  const sortedProviders = useMemo(() => {
    return [...relevantProviders].sort((a, b) => {
      const aAvail = providerAvailability[a.id]?.available ? 1 : 0;
      const bAvail = providerAvailability[b.id]?.available ? 1 : 0;
      if (bAvail !== aAvail) return bAvail - aAvail;
      return (providerAvailability[b.id]?.avgRating || 0) - (providerAvailability[a.id]?.avgRating || 0);
    });
  }, [relevantProviders, providerAvailability]);

  if (isLoading) {
    return <div className="text-sm text-slate-400">Loading technicians...</div>;
  }

  if (relevantProviders.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Technician</label>
      <p className="text-xs text-slate-400 mb-3">
        {selectedDate && selectedTimeSlot
          ? `Showing availability for ${format(selectedDate, 'MMM d')} at ${selectedTimeSlot}`
          : 'Select a date and time in Step 1 to see real-time availability'}
      </p>
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
            <div className="text-xs text-slate-400">Auto-assign best available technician</div>
          </div>
        </button>

        {sortedProviders.map(provider => {
          const selected = selectedProviderId === provider.id;
          const avail = providerAvailability[provider.id] || {};
          const isAvailable = avail.available !== false;
          const hasScheduleInfo = selectedDate && selectedTimeSlot;

          return (
            <button
              key={provider.id}
              onClick={() => isAvailable && onChange(provider.id)}
              disabled={hasScheduleInfo && !isAvailable}
              className={cn(
                "w-full p-3 rounded-xl text-left text-sm transition-all border-2 flex items-center gap-3",
                hasScheduleInfo && !isAvailable
                  ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60"
                  : selected
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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{provider.full_name}</span>
                  {hasScheduleInfo && (
                    isAvailable ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Available
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0 gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> Booked
                      </Badge>
                    )
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  {avail.avgRating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {avail.avgRating}
                      {avail.reviewCount > 0 && <span className="text-slate-300">({avail.reviewCount})</span>}
                    </span>
                  )}
                  {avail.totalJobs > 0 && (
                    <span>{avail.totalJobs} jobs done</span>
                  )}
                  {hasScheduleInfo && avail.dayCount > 0 && isAvailable && (
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Clock className="w-3 h-3" />
                      {avail.dayCount} job{avail.dayCount > 1 ? 's' : ''} that day
                    </span>
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