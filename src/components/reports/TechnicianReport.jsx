import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wrench, Star, Clock, CheckCircle } from 'lucide-react';
import ExportButtons from './ExportButtons';

export default function TechnicianReport({ providers, bookings, reviews, startDate, endDate }) {
  const data = useMemo(() => {
    const filteredBookings = bookings.filter(b =>
      b.scheduled_date && b.scheduled_date >= startDate && b.scheduled_date <= endDate
    );

    const providerStats = providers.map(p => {
      const pBookings = filteredBookings.filter(b => b.assigned_provider_id === p.id);
      const completed = pBookings.filter(b => b.status === 'completed');
      const cancelled = pBookings.filter(b => b.status === 'cancelled');
      const pReviews = reviews.filter(r => r.provider_id === p.id);
      const avgRating = pReviews.length > 0 ? pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length : p.average_rating;

      // Avg completion time (hours) from started_at to completed_at
      const completionTimes = completed
        .filter(b => b.started_at && b.completed_at)
        .map(b => (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60 * 60));
      const avgTime = completionTimes.length > 0 ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : null;

      // Calculate idle time (hours) - estimate based on total days in range
      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      const workingDays = Math.ceil(totalDays * 5 / 7); // Assume 5-day work week
      const estimatedHoursPerDay = 8;
      const totalAvailableHours = workingDays * estimatedHoursPerDay;
      const jobHours = completed.length > 0 ? (completed.length * (avgTime || 4)) : 0;
      const idleHours = Math.max(0, totalAvailableHours - jobHours);

      return {
        name: p.full_name,
        totalJobs: pBookings.length,
        completed: completed.length,
        cancelled: cancelled.length,
        completionRate: pBookings.length > 0 ? (completed.length / pBookings.length * 100) : 0,
        avgRating,
        avgTime,
        idleHours: Math.round(idleHours),
        reviewCount: pReviews.length,
        revenue: completed.reduce((s, b) => s + (b.total_amount || 0), 0),
        isActive: p.is_active,
      };
    }).sort((a, b) => b.completed - a.completed);

    const totalTechnicians = providers.filter(p => p.is_active).length;
    const avgRatingAll = providerStats.filter(p => p.avgRating > 0).reduce((s, p) => s + p.avgRating, 0) / (providerStats.filter(p => p.avgRating > 0).length || 1);
    const totalJobsCompleted = providerStats.reduce((s, p) => s + p.completed, 0);

    const chartData = providerStats.slice(0, 10).map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '…' : p.name,
      completed: p.completed,
      rating: p.avgRating
    }));

    const exportRows = providerStats.map(p => [
      p.name, p.totalJobs, p.completed, p.cancelled, `${p.completionRate.toFixed(1)}%`,
      p.avgRating.toFixed(1), p.avgTime ? `${p.avgTime.toFixed(1)}h` : 'N/A',
      `${p.idleHours}h`, `AED ${p.revenue.toFixed(0)}`,
      p.isActive ? 'Active' : 'Inactive'
    ]);

    return { providerStats, totalTechnicians, avgRatingAll, totalJobsCompleted, chartData, exportRows };
  }, [providers, bookings, reviews, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Wrench, label: 'Active Technicians', value: data.totalTechnicians, color: 'text-slate-900' },
          { icon: CheckCircle, label: 'Jobs Completed', value: data.totalJobsCompleted, color: 'text-emerald-600' },
          { icon: Star, label: 'Avg Rating', value: data.avgRatingAll.toFixed(1), color: 'text-yellow-600' },
          { icon: Clock, label: 'Providers Tracked', value: data.providerStats.length, color: 'text-blue-600' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Technician Performance Comparison</CardTitle>
          <ExportButtons title="Technician_Performance" headers={['Name', 'Total Jobs', 'Completed', 'Cancelled', 'Completion Rate', 'Avg Rating', 'Avg Time', 'Idle Time', 'Revenue', 'Status']} rows={data.exportRows} />
        </CardHeader>
        <CardContent>
          {data.chartData.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No technician data</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Jobs Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader><CardTitle>Detailed Technician Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
             <thead>
               <tr className="border-b bg-slate-50">
                 <th className="text-left p-3 font-medium text-slate-600">Technician</th>
                 <th className="text-right p-3 font-medium text-slate-600">Total Jobs</th>
                 <th className="text-right p-3 font-medium text-slate-600">Completed</th>
                 <th className="text-right p-3 font-medium text-slate-600">Cancelled</th>
                 <th className="text-right p-3 font-medium text-slate-600">Rate</th>
                 <th className="text-right p-3 font-medium text-slate-600">Rating</th>
                 <th className="text-right p-3 font-medium text-slate-600">Avg Time</th>
                 <th className="text-right p-3 font-medium text-slate-600">Idle Time</th>
                 <th className="text-right p-3 font-medium text-slate-600">Revenue</th>
                 <th className="text-right p-3 font-medium text-slate-600">Status</th>
               </tr>
             </thead>
             <tbody>
               {data.providerStats.map((p, idx) => (
                 <tr key={idx} className="border-b hover:bg-slate-50">
                   <td className="p-3 font-medium">{p.name}</td>
                   <td className="p-3 text-right">{p.totalJobs}</td>
                   <td className="p-3 text-right text-emerald-600 font-medium">{p.completed}</td>
                   <td className="p-3 text-right text-red-600">{p.cancelled}</td>
                   <td className="p-3 text-right">{p.completionRate.toFixed(0)}%</td>
                   <td className="p-3 text-right">
                     <span className="inline-flex items-center gap-1">
                       <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                       {p.avgRating.toFixed(1)}
                     </span>
                   </td>
                   <td className="p-3 text-right">{p.avgTime ? `${p.avgTime.toFixed(1)}h` : '—'}</td>
                   <td className="p-3 text-right text-orange-600 font-medium">{p.idleHours}h</td>
                   <td className="p-3 text-right font-medium">AED {p.revenue.toLocaleString()}</td>
                   <td className="p-3 text-right text-xs">
                     <span className={`inline-block px-2 py-1 rounded ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                       {p.isActive ? 'Active' : 'Inactive'}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}