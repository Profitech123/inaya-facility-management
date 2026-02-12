import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function PopularServicesChart({ bookings, services, startDate, endDate }) {
  const chartData = useMemo(() => {
    const filtered = bookings.filter(b =>
      b.scheduled_date && b.scheduled_date >= startDate && b.scheduled_date <= endDate
    );

    const svcMap = {};
    filtered.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      if (!svcMap[name]) svcMap[name] = { count: 0, revenue: 0 };
      svcMap[name].count += 1;
      svcMap[name].revenue += (b.total_amount || 0);
    });

    return Object.entries(svcMap)
      .map(([name, d]) => ({ name, bookings: d.count, revenue: d.revenue }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);
  }, [bookings, services, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Popular Services</CardTitle>
        <p className="text-sm text-slate-500">Top services by number of bookings</p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No booking data</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [name === 'bookings' ? `${v} bookings` : `AED ${v.toLocaleString()}`, name === 'bookings' ? 'Bookings' : 'Revenue']} />
                <Bar dataKey="bookings" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Mini revenue table */}
            <div className="mt-4 space-y-1.5">
              {chartData.map((svc, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600">{svc.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">AED {svc.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}