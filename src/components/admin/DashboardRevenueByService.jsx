import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function DashboardRevenueByService({ bookings, services }) {
  const { chartData, total } = useMemo(() => {
    const svcMap = {};
    bookings.filter(b => b.payment_status === 'paid').forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Other';
      svcMap[name] = (svcMap[name] || 0) + (b.total_amount || 0);
    });

    const sorted = Object.entries(svcMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const total = sorted.reduce((s, d) => s + d.value, 0);
    return { chartData: sorted, total };
  }, [bookings, services]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Revenue by Service</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-slate-400 text-center py-12">No revenue data</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Revenue by Service</CardTitle>
        <p className="text-xs text-slate-400">Paid bookings breakdown</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `AED ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {chartData.map((svc, idx) => {
              const pct = total > 0 ? Math.round((svc.value / total) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 truncate">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-400">{pct}%</span>
                    <span className="font-semibold text-slate-800 w-20 text-right">AED {svc.value.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}