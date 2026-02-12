import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import ExportButtons from './ExportButtons';

const STATUS_COLORS = {
  completed: '#10b981',
  in_progress: '#8b5cf6',
  confirmed: '#3b82f6',
  pending: '#f59e0b',
  cancelled: '#ef4444'
};

export default function BookingReport({ bookings, services, startDate, endDate }) {
  const data = useMemo(() => {
    const filtered = bookings.filter(b =>
      b.scheduled_date && b.scheduled_date >= startDate && b.scheduled_date <= endDate
    );

    const total = filtered.length;
    const completed = filtered.filter(b => b.status === 'completed').length;
    const cancelled = filtered.filter(b => b.status === 'cancelled').length;
    const confirmed = filtered.filter(b => b.status === 'confirmed').length;
    const pending = filtered.filter(b => b.status === 'pending').length;
    const completionRate = total > 0 ? ((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? ((cancelled / total) * 100) : 0;
    const avgValue = total > 0 ? (filtered.reduce((s, b) => s + (b.total_amount || 0), 0) / total) : 0;

    // Status breakdown
    const statusData = Object.entries(
      filtered.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {})
    ).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#94a3b8' }));

    // Popular services
    const svcMap = {};
    filtered.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      svcMap[name] = (svcMap[name] || 0) + 1;
    });
    const popularServices = Object.entries(svcMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Popular time slots
    const slotMap = {};
    filtered.forEach(b => {
      const slot = b.scheduled_time || 'Not specified';
      slotMap[slot] = (slotMap[slot] || 0) + 1;
    });
    const popularSlots = Object.entries(slotMap)
      .map(([slot, count]) => ({ slot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Bookings over time (by month)
    const monthMap = {};
    filtered.forEach(b => {
      const m = b.scheduled_date.substring(0, 7);
      monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const bookingsOverTime = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        bookings: count
      }));

    const exportRows = filtered.map(b => {
      const svc = services.find(s => s.id === b.service_id);
      return [b.id.slice(0, 8), svc?.name || '', b.scheduled_date, b.scheduled_time || '', b.status, b.total_amount?.toFixed(2) || '0'];
    });

    return { total, completed, completionRate, cancellationRate, statusData, popularServices, popularSlots, bookingsOverTime, exportRows };
  }, [bookings, services, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Total Bookings', value: data.total, color: 'text-slate-900' },
          { icon: CheckCircle, label: 'Completed', value: data.completed, color: 'text-emerald-600' },
          { icon: Clock, label: 'Completion Rate', value: `${data.completionRate.toFixed(1)}%`, color: 'text-blue-600' },
          { icon: XCircle, label: 'Cancellation Rate', value: `${data.cancellationRate.toFixed(1)}%`, color: data.cancellationRate > 20 ? 'text-red-600' : 'text-green-600' },
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
          <CardTitle>Bookings Over Time</CardTitle>
          <ExportButtons title="Bookings_Over_Time" headers={['Month', 'Bookings']} rows={data.bookingsOverTime.map(r => [r.month, r.bookings])} />
        </CardHeader>
        <CardContent>
          {data.bookingsOverTime.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No bookings in selected period</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {data.statusData.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {data.statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Popular Services</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.popularServices.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-100 rounded text-xs font-bold text-blue-600 flex items-center justify-center">{idx + 1}</span>
                    <span className="text-slate-700 truncate max-w-[140px]">{s.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{s.count}</span>
                </div>
              ))}
              {data.popularServices.length === 0 && <p className="text-slate-500 text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Popular Time Slots</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.popularSlots.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{s.slot}</span>
                  <span className="font-medium text-slate-900">{s.count} bookings</span>
                </div>
              ))}
              {data.popularSlots.length === 0 && <p className="text-slate-500 text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <ExportButtons title="All_Bookings" headers={['ID', 'Service', 'Date', 'Time', 'Status', 'Amount (AED)']} rows={data.exportRows} />
      </div>
    </div>
  );
}