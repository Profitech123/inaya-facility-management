import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardTechPerformance({ providers, bookings, reviews }) {
  const techStats = useMemo(() => {
    return providers
      .filter(p => p.is_active)
      .map(p => {
        const pBookings = bookings.filter(b => b.assigned_provider_id === p.id);
        const completed = pBookings.filter(b => b.status === 'completed').length;
        const total = pBookings.length;
        const revenue = pBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);
        const pReviews = reviews.filter(r => r.provider_id === p.id);
        const avgRating = pReviews.length > 0
          ? pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length
          : p.average_rating || 0;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          id: p.id,
          name: p.full_name,
          image: p.profile_image,
          completed,
          total,
          revenue,
          rating: Number(avgRating.toFixed(1)),
          completionRate,
        };
      })
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  }, [providers, bookings, reviews]);

  if (techStats.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Top Technicians</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-slate-400 text-center py-8">No technician data</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Technicians</CardTitle>
        <p className="text-xs text-slate-400">By completed jobs</p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {techStats.map((tech, idx) => (
          <div key={tech.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">{tech.name}</div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span>{tech.completed} jobs</span>
                <span>AED {tech.revenue.toLocaleString()}</span>
                <span className={cn(
                  "flex items-center gap-0.5",
                  tech.completionRate >= 80 ? "text-emerald-600" : "text-amber-600"
                )}>
                  {tech.completionRate >= 80 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {tech.completionRate}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-slate-700">{tech.rating}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}