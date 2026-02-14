import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Legend } from 'recharts';
import { TrendingDown, AlertTriangle } from 'lucide-react';

export default function ChurnRateChart({ subscriptions, startDate, endDate }) {
  const { chartData, stats } = useMemo(() => {
    const monthMap = {};

    subscriptions.forEach(sub => {
      if (sub.start_date) {
        const m = sub.start_date.substring(0, 7);
        if (!monthMap[m]) monthMap[m] = { new: 0, cancelled: 0, active: 0, paused: 0 };
        monthMap[m].new += 1;
      }
      if (sub.status === 'cancelled' && sub.cancelled_at) {
        const m = sub.cancelled_at.substring(0, 7);
        if (!monthMap[m]) monthMap[m] = { new: 0, cancelled: 0, active: 0, paused: 0 };
        monthMap[m].cancelled += 1;
      }
      if (sub.status === 'paused' && sub.paused_at) {
        const m = sub.paused_at.substring(0, 7);
        if (!monthMap[m]) monthMap[m] = { new: 0, cancelled: 0, active: 0, paused: 0 };
        monthMap[m].paused += 1;
      }
    });

    // Build cumulative active count and churn rate
    let activeCount = 0;
    const sorted = Object.entries(monthMap)
      .filter(([m]) => m >= startDate.substring(0, 7) && m <= endDate.substring(0, 7))
      .sort(([a], [b]) => a.localeCompare(b));

    // Count subs before the period
    subscriptions.forEach(sub => {
      if (sub.start_date && sub.start_date.substring(0, 7) < startDate.substring(0, 7)) {
        if (sub.status === 'active' || sub.status === 'paused') activeCount++;
        if (sub.status === 'cancelled' && sub.cancelled_at && sub.cancelled_at.substring(0, 7) >= startDate.substring(0, 7)) {
          activeCount++; // was active at period start
        }
      }
    });

    const chartData = sorted.map(([month, d]) => {
      activeCount = activeCount + d.new - d.cancelled;
      const base = Math.max(1, activeCount + d.cancelled);
      const churnRate = (d.cancelled / base) * 100;
      const pauseRate = (d.paused / base) * 100;

      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'Churn Rate': Number(churnRate.toFixed(1)),
        'Pause Rate': Number(pauseRate.toFixed(1)),
        'Cancelled': d.cancelled,
        'New': d.new,
        'Active Base': activeCount,
      };
    });

    const totalCancelled = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalActive = subscriptions.filter(s => s.status === 'active').length;
    const totalPaused = subscriptions.filter(s => s.status === 'paused').length;
    const overallChurn = (totalActive + totalCancelled) > 0
      ? ((totalCancelled / (totalActive + totalCancelled)) * 100).toFixed(1)
      : '0.0';

    // Average churn
    const avgChurn = chartData.length > 0
      ? (chartData.reduce((s, d) => s + d['Churn Rate'], 0) / chartData.length).toFixed(1)
      : '0.0';

    // Top cancel reasons
    const reasons = {};
    subscriptions.filter(s => s.cancel_reason).forEach(s => {
      const r = s.cancel_reason.toLowerCase().trim();
      reasons[r] = (reasons[r] || 0) + 1;
    });
    const topReasons = Object.entries(reasons)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    return {
      chartData,
      stats: {
        overallChurn,
        avgChurn,
        totalCancelled,
        totalActive,
        totalPaused,
        topReasons
      }
    };
  }, [subscriptions, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Subscription Churn Analysis
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Monthly churn and pause rates over time</p>
          </div>
          <div className="flex gap-3 text-right">
            <div>
              <div className="text-xs text-slate-400">Overall Churn</div>
              <div className={`text-xl font-bold ${Number(stats.overallChurn) > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                {stats.overallChurn}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Avg Monthly</div>
              <div className="text-xl font-bold text-slate-800">{stats.avgChurn}%</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No subscription data in period</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="%" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="Churn Rate" stroke="#ef4444" strokeWidth={2} fill="url(#churnGrad)" />
              <Line yAxisId="left" type="monotone" dataKey="Pause Rate" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              <Bar yAxisId="right" dataKey="New" fill="#10b981" radius={[3, 3, 0, 0]} opacity={0.6} />
              <Bar yAxisId="right" dataKey="Cancelled" fill="#ef4444" radius={[3, 3, 0, 0]} opacity={0.6} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Cancellation reasons */}
        {stats.topReasons.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Top Cancellation Reasons
            </h4>
            <div className="space-y-2">
              {stats.topReasons.map((r, i) => {
                const pct = stats.totalCancelled > 0 ? (r.count / stats.totalCancelled * 100).toFixed(0) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 capitalize">{r.reason}</span>
                        <span className="text-xs text-slate-500">{r.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}