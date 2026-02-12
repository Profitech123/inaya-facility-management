import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

export default function TechnicianPerformanceChart({ providers, bookings, reviews, startDate, endDate }) {
  const { chartData, topPerformers } = useMemo(() => {
    const filtered = bookings.filter(b =>
      b.scheduled_date && b.scheduled_date >= startDate && b.scheduled_date <= endDate
    );

    const stats = providers.filter(p => p.is_active).map(p => {
      const pBookings = filtered.filter(b => b.assigned_provider_id === p.id);
      const completed = pBookings.filter(b => b.status === 'completed').length;
      const cancelled = pBookings.filter(b => b.status === 'cancelled').length;
      const pReviews = reviews.filter(r => r.provider_id === p.id);
      const avgRating = pReviews.length > 0
        ? pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length
        : p.average_rating || 0;
      const revenue = pBookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);

      return {
        name: p.full_name,
        shortName: p.full_name.length > 14 ? p.full_name.substring(0, 14) + '…' : p.full_name,
        completed,
        cancelled,
        total: pBookings.length,
        rating: Number(avgRating.toFixed(1)),
        revenue,
        reviews: pReviews.length,
      };
    }).sort((a, b) => b.completed - a.completed);

    const chartData = stats.slice(0, 10);
    const topPerformers = stats.slice(0, 5);

    return { chartData, topPerformers };
  }, [providers, bookings, reviews, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <p className="text-sm text-slate-500">Jobs completed and cancelled by technician</p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No technician data</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" fill="#f87171" name="Cancelled" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Top performers */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Performers</h4>
              <div className="space-y-2">
                {topPerformers.map((tech, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{tech.name}</div>
                        <div className="text-xs text-slate-400">{tech.completed} jobs · AED {tech.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-slate-700">{tech.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}