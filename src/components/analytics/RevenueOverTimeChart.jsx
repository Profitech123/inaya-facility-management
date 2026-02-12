import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RevenueOverTimeChart({ bookings, subscriptions, startDate, endDate }) {
  const chartData = useMemo(() => {
    const monthMap = {};

    // Booking revenue
    bookings
      .filter(b => b.payment_status === 'paid' && b.scheduled_date >= startDate && b.scheduled_date <= endDate)
      .forEach(b => {
        const m = b.scheduled_date.substring(0, 7);
        if (!monthMap[m]) monthMap[m] = { bookingRevenue: 0, subscriptionRevenue: 0 };
        monthMap[m].bookingRevenue += (b.total_amount || 0);
      });

    // Subscription revenue (monthly_amount for each active month)
    subscriptions
      .filter(s => s.start_date)
      .forEach(sub => {
        const start = sub.start_date.substring(0, 7);
        const end = sub.end_date ? sub.end_date.substring(0, 7) : endDate.substring(0, 7);
        let current = start;
        while (current <= end && current <= endDate.substring(0, 7) && current >= startDate.substring(0, 7)) {
          if (!monthMap[current]) monthMap[current] = { bookingRevenue: 0, subscriptionRevenue: 0 };
          monthMap[current].subscriptionRevenue += (sub.monthly_amount || 0);
          // next month
          const [y, mo] = current.split('-').map(Number);
          const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`;
          current = next;
        }
      });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'On-Demand': data.bookingRevenue,
        'Subscriptions': data.subscriptionRevenue,
        'Total': data.bookingRevenue + data.subscriptionRevenue,
      }));
  }, [bookings, subscriptions, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <p className="text-sm text-slate-500">On-demand bookings vs subscription revenue by month</p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No revenue data in selected period</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`AED ${v.toLocaleString()}`, undefined]} />
              <Legend />
              <Area type="monotone" dataKey="On-Demand" stroke="#10b981" strokeWidth={2} fill="url(#colorBooking)" />
              <Area type="monotone" dataKey="Subscriptions" stroke="#6366f1" strokeWidth={2} fill="url(#colorSub)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}