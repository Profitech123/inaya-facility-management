import React, { useMemo } from 'react';
import { 
  DollarSign, Users, TrendingUp, TrendingDown, Repeat, Star, Clock, 
  Percent, Wrench, ArrowUpRight, ArrowDownRight, Minus, Zap, ShieldCheck
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

function MiniSparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TrendBadge({ current, previous, inverse = false }) {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const isPositive = inverse ? change < 0 : change > 0;
  const isNeutral = Math.abs(change) < 1;
  if (isNeutral) return <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-100 rounded-full">0%</span>;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
      {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export default function PremiumKPICards({ bookings, subscriptions, providers, users, services, startDate, endDate }) {
  const kpis = useMemo(() => {
    const inRange = (d) => d && d >= startDate && d <= endDate;
    const daysDiff = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000));
    const prevStart = new Date(new Date(startDate).getTime() - daysDiff * 86400000).toISOString().split('T')[0];
    const inPrev = (d) => d && d >= prevStart && d < startDate;

    // Revenue
    const paidCurrent = bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date));
    const paidPrev = bookings.filter(b => b.payment_status === 'paid' && inPrev(b.scheduled_date));
    const revenueCurrent = paidCurrent.reduce((s, b) => s + (b.total_amount || 0), 0);
    const revenuePrev = paidPrev.reduce((s, b) => s + (b.total_amount || 0), 0);

    // Revenue sparkline
    const revMonths = {};
    paidCurrent.forEach(b => {
      const m = b.scheduled_date?.substring(0, 7);
      if (m) revMonths[m] = (revMonths[m] || 0) + (b.total_amount || 0);
    });
    const revSparkline = Object.entries(revMonths).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ v }));

    // MRR
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const mrr = activeSubs.reduce((s, sub) => s + (sub.monthly_amount || 0), 0);

    // Bookings sparkline
    const bookingMonths = {};
    bookings.filter(b => inRange(b.scheduled_date)).forEach(b => {
      const m = b.scheduled_date?.substring(0, 7);
      if (m) bookingMonths[m] = (bookingMonths[m] || 0) + 1;
    });
    const bookingSparkline = Object.entries(bookingMonths).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ v }));

    // Completed jobs
    const completedCurrent = bookings.filter(b => b.status === 'completed' && inRange(b.scheduled_date)).length;
    const completedPrev = bookings.filter(b => b.status === 'completed' && inPrev(b.scheduled_date)).length;

    // Active customers
    const currentCustomers = new Set(bookings.filter(b => inRange(b.scheduled_date)).map(b => b.customer_id)).size;
    const prevCustomers = new Set(bookings.filter(b => inPrev(b.scheduled_date)).map(b => b.customer_id)).size;

    // Avg satisfaction (from completion rate as proxy)
    const totalInRange = bookings.filter(b => inRange(b.scheduled_date)).length;
    const satisfactionRate = totalInRange > 0 ? (completedCurrent / totalInRange * 100) : 0;
    const totalInPrev = bookings.filter(b => inPrev(b.scheduled_date)).length;
    const prevSatisfaction = totalInPrev > 0 ? (completedPrev / totalInPrev * 100) : 0;

    // Tech utilization
    const activeTechs = providers.filter(p => p.is_active !== false);
    const avgBookingsPerTech = activeTechs.length > 0 ? completedCurrent / activeTechs.length : 0;

    return [
      {
        label: 'Total Revenue',
        value: `AED ${revenueCurrent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/10',
        current: revenueCurrent, previous: revenuePrev,
        sparkline: revSparkline, sparkColor: '#10b981',
        sub: 'In selected period'
      },
      {
        label: 'Monthly Recurring',
        value: `AED ${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        icon: Repeat, gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-500/10',
        current: null, previous: null,
        sub: `${activeSubs.length} active subscriptions`
      },
      {
        label: 'Completed Jobs',
        value: completedCurrent.toLocaleString(),
        icon: Zap, gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-500/10',
        current: completedCurrent, previous: completedPrev,
        sparkline: bookingSparkline, sparkColor: '#8b5cf6',
        sub: 'In selected period'
      },
      {
        label: 'Active Customers',
        value: currentCustomers,
        icon: Users, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-500/10',
        current: currentCustomers, previous: prevCustomers,
        sub: `${providers.filter(p => p.is_active !== false).length} active techs`
      },
      {
        label: 'Success Rate',
        value: `${satisfactionRate.toFixed(1)}%`,
        icon: ShieldCheck, gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-500/10',
        current: satisfactionRate, previous: prevSatisfaction,
        sub: 'Completion rate'
      },
      {
        label: 'Avg Jobs/Tech',
        value: avgBookingsPerTech.toFixed(1),
        icon: Wrench, gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-500/10',
        current: null, previous: null,
        sub: `${activeTechs.length} technicians`
      },
    ];
  }, [bookings, subscriptions, providers, users, services, startDate, endDate]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            {/* Gradient accent top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <Icon className="w-4.5 h-4.5 text-slate-600" />
              </div>
              {kpi.current !== null && (
                <TrendBadge current={kpi.current} previous={kpi.previous} inverse={kpi.inverse} />
              )}
            </div>

            <div className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">{kpi.label}</div>
            
            {kpi.sparkline && kpi.sparkline.length > 1 && (
              <div className="mt-2 -mx-1">
                <MiniSparkline data={kpi.sparkline} color={kpi.sparkColor} />
              </div>
            )}
            
            {kpi.sub && <div className="text-[10px] text-slate-400 mt-1">{kpi.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}