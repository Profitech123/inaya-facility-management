import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ComposedChart, Area, Legend } from 'recharts';
import { Clock, TrendingDown } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];

export default function ServiceCompletionTimeChart({ bookings, services, startDate, endDate }) {
  const { byService, overTime, stats } = useMemo(() => {
    const completed = bookings.filter(b =>
      b.status === 'completed' &&
      b.scheduled_date >= startDate &&
      b.scheduled_date <= endDate
    );

    // By service
    const svcTimes = {};
    completed.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      const expected = svc?.duration_minutes || 60;

      let actual = expected;
      if (b.started_at && b.completed_at) {
        actual = (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60);
      }

      if (!svcTimes[name]) svcTimes[name] = { times: [], expected };
      svcTimes[name].times.push(actual);
    });

    const byService = Object.entries(svcTimes)
      .map(([name, d]) => {
        const avg = d.times.reduce((a, b) => a + b, 0) / d.times.length;
        const variance = ((avg - d.expected) / d.expected) * 100;
        return {
          name: name.length > 20 ? name.substring(0, 20) + '…' : name,
          fullName: name,
          'Avg Time': Math.round(avg),
          'Expected': d.expected,
          variance: Number(variance.toFixed(1)),
          count: d.times.length,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Over time (monthly avg)
    const monthTimes = {};
    completed.forEach(b => {
      const m = b.scheduled_date.substring(0, 7);
      const svc = services.find(s => s.id === b.service_id);
      let actual = svc?.duration_minutes || 60;
      if (b.started_at && b.completed_at) {
        actual = (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60);
      }
      if (!monthTimes[m]) monthTimes[m] = [];
      monthTimes[m].push(actual);
    });

    const overTime = Object.entries(monthTimes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, times]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'Avg Minutes': Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        'Jobs': times.length,
      }));

    // Overall stats
    const allTimes = completed.map(b => {
      const svc = services.find(s => s.id === b.service_id);
      if (b.started_at && b.completed_at) {
        return (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60);
      }
      return svc?.duration_minutes || 60;
    });

    const avg = allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0;
    const sorted = [...allTimes].sort((a, b) => a - b);
    const p90 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.9)] : 0;
    const fastest = sorted.length > 0 ? sorted[0] : 0;
    const slowest = sorted.length > 0 ? sorted[sorted.length - 1] : 0;

    const onTimeCount = completed.filter(b => {
      const svc = services.find(s => s.id === b.service_id);
      const expected = svc?.duration_minutes || 60;
      let actual = expected;
      if (b.started_at && b.completed_at) {
        actual = (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60);
      }
      return actual <= expected * 1.15; // within 15% of expected
    }).length;
    const onTimeRate = completed.length > 0 ? (onTimeCount / completed.length) * 100 : 0;

    return {
      byService,
      overTime,
      stats: {
        avg: Math.round(avg),
        p90: Math.round(p90),
        fastest: Math.round(fastest),
        slowest: Math.round(slowest),
        total: completed.length,
        onTimeRate: onTimeRate.toFixed(0),
      }
    };
  }, [bookings, services, startDate, endDate]);

  const formatTime = (min) => min >= 60 ? `${(min / 60).toFixed(1)}h` : `${min}m`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Service Completion Time
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Average completion times and efficiency</p>
          </div>
          <div className="flex gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Avg Time</div>
              <div className="text-lg font-bold text-slate-800">{formatTime(stats.avg)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">On-Time Rate</div>
              <div className={`text-lg font-bold ${Number(stats.onTimeRate) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stats.onTimeRate}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">P90</div>
              <div className="text-lg font-bold text-slate-600">{formatTime(stats.p90)}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion time trend */}
        {overTime.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-2">Monthly Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={overTime}>
                <defs>
                  <linearGradient id="avgTimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="m" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="Avg Minutes" stroke="#f59e0b" strokeWidth={2} fill="url(#avgTimeGrad)" />
                <Bar yAxisId="right" dataKey="Jobs" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* By service comparison */}
        {byService.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-xs font-semibold text-slate-500 mb-2">By Service (Actual vs Expected)</h4>
            <ResponsiveContainer width="100%" height={Math.max(200, byService.length * 35)}>
              <BarChart data={byService} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="m" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border rounded-lg shadow-lg p-3 text-xs">
                        <div className="font-semibold mb-1">{d.fullName}</div>
                        <div>Avg: {formatTime(d['Avg Time'])} · Expected: {formatTime(d.Expected)}</div>
                        <div>Variance: <span className={d.variance > 0 ? 'text-red-500' : 'text-emerald-500'}>{d.variance > 0 ? '+' : ''}{d.variance}%</span></div>
                        <div>{d.count} completed jobs</div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="Avg Time" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="Expected" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {byService.length === 0 && overTime.length === 0 && (
          <p className="text-slate-400 text-center py-12">No completion data in selected period</p>
        )}
      </CardContent>
    </Card>
  );
}