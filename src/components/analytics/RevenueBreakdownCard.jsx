import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { DollarSign, Package, Layers } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

export default function RevenueBreakdownCard({ bookings, subscriptions, services, packages, startDate, endDate }) {
  const [tab, setTab] = useState('service');

  const data = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;
    const paidBookings = bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date));

    // By service
    const svcRevMap = {};
    paidBookings.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      svcRevMap[name] = (svcRevMap[name] || 0) + (b.total_amount || 0);
    });
    const byService = Object.entries(svcRevMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // By package
    const pkgRevMap = {};
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
      const pkg = packages.find(p => p.id === sub.package_id);
      const name = pkg?.name || 'Unknown Package';
      if (!pkgRevMap[name]) pkgRevMap[name] = { mrr: 0, count: 0 };
      pkgRevMap[name].mrr += (sub.monthly_amount || 0);
      pkgRevMap[name].count += 1;
    });
    const byPackage = Object.entries(pkgRevMap)
      .map(([name, d]) => ({ name, revenue: d.mrr, count: d.count }))
      .sort((a, b) => b.revenue - a.revenue);

    // Stream breakdown
    const onDemandRev = paidBookings.reduce((s, b) => s + (b.total_amount || 0), 0);
    const subRev = subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + (sub.monthly_amount || 0), 0);
    const streams = [
      { name: 'On-Demand', value: onDemandRev },
      { name: 'Subscriptions (MRR)', value: subRev },
    ].filter(s => s.value > 0);
    const totalRevenue = onDemandRev + subRev;

    return { byService, byPackage, streams, totalRevenue, onDemandRev, subRev };
  }, [bookings, subscriptions, services, packages, startDate, endDate]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Revenue Breakdown
            </CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">By service, package, and revenue stream</p>
          </div>
          <div className="flex gap-1">
            {[
              { key: 'service', label: 'By Service', icon: Layers },
              { key: 'package', label: 'By Package', icon: Package },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium transition ${tab === t.key ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`}>
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Revenue streams pie */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/3">
            {data.streams.length > 0 && (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data.streams} dataKey="value" nameKey="name" cx="50%" cy="50%" 
                    outerRadius={55} innerRadius={25} strokeWidth={2}>
                    <Cell fill="#10b981" />
                    <Cell fill="#6366f1" />
                  </Pie>
                  <Tooltip formatter={v => [`AED ${v.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-lg font-bold text-emerald-700">AED {data.onDemandRev.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-600 font-medium">On-Demand Revenue</div>
              {data.totalRevenue > 0 && (
                <div className="text-[10px] text-emerald-500 mt-0.5">{((data.onDemandRev / data.totalRevenue) * 100).toFixed(0)}% of total</div>
              )}
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
              <div className="text-lg font-bold text-indigo-700">AED {data.subRev.toLocaleString()}</div>
              <div className="text-[10px] text-indigo-600 font-medium">Subscription MRR</div>
              {data.totalRevenue > 0 && (
                <div className="text-[10px] text-indigo-500 mt-0.5">{((data.subRev / data.totalRevenue) * 100).toFixed(0)}% of total</div>
              )}
            </div>
          </div>
        </div>

        {/* Service or Package breakdown */}
        {tab === 'service' ? (
          data.byService.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No revenue data</p>
          ) : (
            <div className="space-y-2">
              {data.byService.map((svc, i) => {
                const pct = data.onDemandRev > 0 ? (svc.revenue / data.onDemandRev * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700 truncate">{svc.name}</span>
                        <span className="text-xs font-bold text-slate-900">AED {svc.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 w-10 text-right flex-shrink-0">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          data.byPackage.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-sm">No package data</p>
          ) : (
            <div className="space-y-2">
              {data.byPackage.map((pkg, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{pkg.name}</div>
                      <div className="text-[10px] text-slate-400">{pkg.count} subscriber{pkg.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">AED {pkg.revenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">per month</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}