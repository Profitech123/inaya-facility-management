import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionGrowthChart({ subscriptions, packages, startDate, endDate }) {
  const { growthData, packageBreakdown, stats } = useMemo(() => {
    // Net subscriptions per month: new - cancelled
    const monthMap = {};

    subscriptions.forEach(sub => {
      if (sub.start_date) {
        const m = sub.start_date.substring(0, 7);
        if (m >= startDate.substring(0, 7) && m <= endDate.substring(0, 7)) {
          if (!monthMap[m]) monthMap[m] = { new: 0, cancelled: 0, mrr: 0 };
          monthMap[m].new += 1;
          if (sub.status === 'active') monthMap[m].mrr += (sub.monthly_amount || 0);
        }
      }
      if (sub.status === 'cancelled' && sub.cancelled_at) {
        const m = sub.cancelled_at.substring(0, 7);
        if (m >= startDate.substring(0, 7) && m <= endDate.substring(0, 7)) {
          if (!monthMap[m]) monthMap[m] = { new: 0, cancelled: 0, mrr: 0 };
          monthMap[m].cancelled += 1;
        }
      }
    });

    const growthData = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'New': d.new,
        'Cancelled': -d.cancelled,
        'Net': d.new - d.cancelled,
      }));

    // Package breakdown
    const pkgMap = {};
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
      const pkg = packages.find(p => p.id === sub.package_id);
      const name = pkg?.name || 'Unknown';
      if (!pkgMap[name]) pkgMap[name] = { count: 0, mrr: 0 };
      pkgMap[name].count += 1;
      pkgMap[name].mrr += (sub.monthly_amount || 0);
    });
    const packageBreakdown = Object.entries(pkgMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.count - a.count);

    const active = subscriptions.filter(s => s.status === 'active').length;
    const paused = subscriptions.filter(s => s.status === 'paused').length;
    const cancelled = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalMRR = subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + (sub.monthly_amount || 0), 0);

    return { growthData, packageBreakdown, stats: { active, paused, cancelled, totalMRR } };
  }, [subscriptions, packages, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Growth</CardTitle>
            <p className="text-sm text-slate-500">New vs cancelled subscriptions over time</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-100 text-emerald-800">{stats.active} Active</Badge>
            <Badge className="bg-amber-100 text-amber-800">{stats.paused} Paused</Badge>
            <Badge className="bg-red-100 text-red-800">{stats.cancelled} Cancelled</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {growthData.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No subscription data in period</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="New" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Package breakdown */}
        {packageBreakdown.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Active Subscriptions by Package</h4>
            <div className="space-y-2">
              {packageBreakdown.map((pkg, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">{pkg.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{pkg.count}</Badge>
                  </div>
                  <span className="font-medium text-slate-900">AED {pkg.mrr.toLocaleString()}/mo</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}