import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { parseISO, isValid, format, subMonths, startOfMonth } from 'date-fns';

export default function DashboardMiniSubscriptions({ subscriptions }) {
  const { chartData, stats } = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active').length;
    const paused = subscriptions.filter(s => s.status === 'paused').length;
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + (sub.monthly_amount || 0), 0);

    // Last 6 months of new subs
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(format(startOfMonth(subMonths(new Date(), i)), 'yyyy-MM'));
    }

    const chartData = months.map(m => {
      const newSubs = subscriptions.filter(s => s.start_date && s.start_date.substring(0, 7) === m).length;
      const cancelled = subscriptions.filter(s => s.status === 'cancelled' && s.cancelled_at && s.cancelled_at.substring(0, 7) === m).length;
      return {
        month: format(parseISO(m + '-01'), 'MMM'),
        New: newSubs,
        Cancelled: cancelled,
      };
    });

    return { chartData, stats: { active, paused, mrr } };
  }, [subscriptions]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Subscription Growth</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{stats.active} Active</Badge>
            <Badge className="bg-amber-100 text-amber-700 text-[10px]">{stats.paused} Paused</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-right mb-1">
          <span className="text-xs text-slate-400">MRR: </span>
          <span className="text-sm font-bold text-emerald-600">AED {stats.mrr.toLocaleString()}</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={25} />
            <Tooltip />
            <Bar dataKey="New" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cancelled" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}