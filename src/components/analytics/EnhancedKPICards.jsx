import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DollarSign, Users, TrendingUp, TrendingDown, Calendar, Repeat, Star,
  Clock, Percent, Wrench, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

function TrendBadge({ current, previous, inverse = false }) {
  if (previous === 0 || previous === null || previous === undefined) {
    return <span className="text-[10px] text-slate-400">—</span>;
  }
  const change = ((current - previous) / previous) * 100;
  const isPositive = inverse ? change < 0 : change > 0;
  const isNeutral = Math.abs(change) < 1;

  if (isNeutral) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
        <Minus className="w-3 h-3" /> 0%
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
      {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export default function EnhancedKPICards({ bookings, subscriptions, providers, users, services, startDate, endDate }) {
  const kpis = useMemo(() => {
    const inRange = (dateStr) => dateStr && dateStr >= startDate && dateStr <= endDate;

    // Split into current period and previous period of same length
    const daysDiff = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    const prevStart = new Date(new Date(startDate).getTime() - daysDiff * 86400000).toISOString().split('T')[0];
    const prevEnd = startDate;
    const inPrev = (dateStr) => dateStr && dateStr >= prevStart && dateStr < prevEnd;

    // --- REVENUE ---
    const paidCurrent = bookings.filter(b => b.payment_status === 'paid' && inRange(b.scheduled_date));
    const paidPrev = bookings.filter(b => b.payment_status === 'paid' && inPrev(b.scheduled_date));
    const revenueCurrent = paidCurrent.reduce((s, b) => s + (b.total_amount || 0), 0);
    const revenuePrev = paidPrev.reduce((s, b) => s + (b.total_amount || 0), 0);

    // --- MRR ---
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const mrr = activeSubs.reduce((s, sub) => s + (sub.monthly_amount || 0), 0);

    // --- CLV ---
    const customerRevenue = {};
    bookings.forEach(b => {
      if (!b.customer_id) return;
      customerRevenue[b.customer_id] = (customerRevenue[b.customer_id] || 0) + (b.total_amount || 0);
    });
    subscriptions.forEach(s => {
      if (!s.customer_id) return;
      const start = new Date(s.start_date || s.created_date);
      const end = s.end_date ? new Date(s.end_date) : new Date();
      const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)));
      customerRevenue[s.customer_id] = (customerRevenue[s.customer_id] || 0) + (s.monthly_amount || 0) * months;
    });
    const clvValues = Object.values(customerRevenue);
    const avgCLV = clvValues.length > 0 ? clvValues.reduce((a, b) => a + b, 0) / clvValues.length : 0;

    // --- CHURN RATE ---
    const totalSubsCreatedInRange = subscriptions.filter(s => s.start_date && inRange(s.start_date)).length;
    const cancelledInRange = subscriptions.filter(s => s.status === 'cancelled' && s.cancelled_at && inRange(s.cancelled_at.split('T')[0])).length;
    const churnRate = activeSubs.length + cancelledInRange > 0
      ? (cancelledInRange / (activeSubs.length + cancelledInRange)) * 100
      : 0;
    const cancelledPrev = subscriptions.filter(s => s.status === 'cancelled' && s.cancelled_at && inPrev(s.cancelled_at.split('T')[0])).length;
    const prevActiveGuess = activeSubs.length + cancelledInRange; // rough approximation
    const prevChurnRate = prevActiveGuess > 0 ? (cancelledPrev / prevActiveGuess) * 100 : 0;

    // --- AVG SERVICE COMPLETION TIME ---
    const completedCurrent = bookings.filter(b => b.status === 'completed' && inRange(b.scheduled_date));
    const completionTimes = completedCurrent.map(b => {
      if (b.started_at && b.completed_at) {
        return (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60); // minutes
      }
      const svc = services?.find(s => s.id === b.service_id);
      return svc?.duration_minutes || 60;
    });
    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    const completedPrev = bookings.filter(b => b.status === 'completed' && inPrev(b.scheduled_date));
    const prevCompletionTimes = completedPrev.map(b => {
      if (b.started_at && b.completed_at) {
        return (new Date(b.completed_at) - new Date(b.started_at)) / (1000 * 60);
      }
      const svc = services?.find(s => s.id === b.service_id);
      return svc?.duration_minutes || 60;
    });
    const avgCompletionTimePrev = prevCompletionTimes.length > 0
      ? prevCompletionTimes.reduce((a, b) => a + b, 0) / prevCompletionTimes.length
      : 0;

    // --- TECHNICIAN UTILIZATION RATE ---
    const MONTHLY_HOURS = 176;
    const activeTechs = providers.filter(p => p.is_active !== false);
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let totalUtil = 0;
    activeTechs.forEach(p => {
      const techBookings = bookings.filter(b =>
        b.assigned_provider_id === p.id && b.status === 'completed' &&
        b.created_date && new Date(b.created_date) >= monthAgo
      );
      let serviceMin = 0;
      techBookings.forEach(b => {
        const svc = services?.find(s => s.id === b.service_id);
        serviceMin += svc?.duration_minutes || 60;
      });
      const travelMin = techBookings.length * 35;
      const hours = (serviceMin + travelMin) / 60;
      totalUtil += MONTHLY_HOURS > 0 ? Math.min(100, (hours / MONTHLY_HOURS) * 100) : 0;
    });
    const avgUtilization = activeTechs.length > 0 ? totalUtil / activeTechs.length : 0;

    // --- COMPLETED JOBS ---
    const completedJobsCurrent = bookings.filter(b => b.status === 'completed' && inRange(b.scheduled_date)).length;
    const completedJobsPrev = bookings.filter(b => b.status === 'completed' && inPrev(b.scheduled_date)).length;

    // --- UNIQUE CUSTOMERS ---
    const currentCustomers = new Set(bookings.filter(b => inRange(b.scheduled_date)).map(b => b.customer_id)).size;
    const prevCustomers = new Set(bookings.filter(b => inPrev(b.scheduled_date)).map(b => b.customer_id)).size;

    return [
      {
        label: 'Total Revenue',
        value: `AED ${revenueCurrent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        icon: DollarSign,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        current: revenueCurrent,
        previous: revenuePrev,
        subtitle: 'In selected period'
      },
      {
        label: 'Monthly Recurring',
        value: `AED ${mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        icon: Repeat,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        current: null,
        previous: null,
        subtitle: `${activeSubs.length} active subs`
      },
      {
        label: 'Avg Customer LTV',
        value: `AED ${Math.round(avgCLV).toLocaleString()}`,
        icon: TrendingUp,
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        current: null,
        previous: null,
        subtitle: `${clvValues.length} customers`
      },
      {
        label: 'Churn Rate',
        value: `${churnRate.toFixed(1)}%`,
        icon: Percent,
        color: churnRate > 10 ? 'text-red-600' : 'text-emerald-600',
        bg: churnRate > 10 ? 'bg-red-50' : 'bg-emerald-50',
        current: churnRate,
        previous: prevChurnRate,
        inverse: true,
        subtitle: `${cancelledInRange} cancelled`
      },
      {
        label: 'Avg Completion Time',
        value: avgCompletionTime >= 60
          ? `${(avgCompletionTime / 60).toFixed(1)}h`
          : `${Math.round(avgCompletionTime)}m`,
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        current: avgCompletionTime,
        previous: avgCompletionTimePrev,
        inverse: true,
        subtitle: `${completedCurrent.length} jobs`
      },
      {
        label: 'Tech Utilization',
        value: `${Math.round(avgUtilization)}%`,
        icon: Wrench,
        color: avgUtilization > 85 ? 'text-red-600' : avgUtilization > 40 ? 'text-emerald-600' : 'text-amber-600',
        bg: avgUtilization > 85 ? 'bg-red-50' : avgUtilization > 40 ? 'bg-emerald-50' : 'bg-amber-50',
        current: null,
        previous: null,
        subtitle: `${activeTechs.length} active techs`
      },
      {
        label: 'Completed Jobs',
        value: completedJobsCurrent,
        icon: Calendar,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        current: completedJobsCurrent,
        previous: completedJobsPrev,
        subtitle: 'In selected period'
      },
      {
        label: 'Active Customers',
        value: currentCustomers,
        icon: Users,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        current: currentCustomers,
        previous: prevCustomers,
        subtitle: 'In selected period'
      },
    ];
  }, [bookings, subscriptions, providers, users, services, startDate, endDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className="hover:shadow-md transition-shadow border-slate-200/80">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                {kpi.current !== null && (
                  <TrendBadge current={kpi.current} previous={kpi.previous} inverse={kpi.inverse} />
                )}
              </div>
              <div className={`text-2xl font-bold text-slate-900`}>{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
              {kpi.subtitle && <div className="text-[10px] text-slate-400 mt-1">{kpi.subtitle}</div>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}