import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO, isValid } from 'date-fns';

export default function DashboardBookingTrends({ bookings }) {
  const chartData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayBookings = bookings.filter(b => {
        if (!b.created_date) return false;
        const d = parseISO(b.created_date);
        return isValid(d) && isSameDay(d, day);
      });
      const revenue = dayBookings
        .filter(b => b.payment_status === 'paid')
        .reduce((s, b) => s + (b.total_amount || 0), 0);

      return {
        date: format(day, 'MMM d'),
        bookings: dayBookings.length,
        revenue,
      };
    });
  }, [bookings]);

  const totalLast30 = chartData.reduce((s, d) => s + d.bookings, 0);
  const revenueLast30 = chartData.reduce((s, d) => s + d.revenue, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Booking Trends</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
          </div>
          <div className="flex gap-5 text-right">
            <div>
              <div className="text-xs text-slate-400">Bookings</div>
              <div className="text-lg font-bold text-emerald-600">{totalLast30}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Revenue</div>
              <div className="text-lg font-bold text-slate-800">AED {revenueLast30.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
            <Tooltip
              formatter={(value, name) => [
                name === 'bookings' ? value : `AED ${value.toLocaleString()}`,
                name === 'bookings' ? 'Bookings' : 'Revenue'
              ]}
            />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradBookings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}