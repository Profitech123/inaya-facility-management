import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';

export default function CustomerAcquisitionChart({ bookings, subscriptions, startDate, endDate }) {
  const { chartData, stats } = useMemo(() => {
    // Determine first-seen month for each customer
    const firstSeen = {};
    [...bookings, ...subscriptions]
      .sort((a, b) => (a.created_date || '').localeCompare(b.created_date || ''))
      .forEach(item => {
        const cid = item.customer_id;
        if (!firstSeen[cid] && item.created_date) {
          firstSeen[cid] = item.created_date.substring(0, 7);
        }
      });

    // New customers by month
    const monthMap = {};
    Object.values(firstSeen).forEach(m => {
      if (m >= startDate.substring(0, 7) && m <= endDate.substring(0, 7)) {
        monthMap[m] = (monthMap[m] || 0) + 1;
      }
    });

    // Build cumulative data
    let cumulative = 0;
    // Count customers before start date
    Object.entries(firstSeen).forEach(([, m]) => {
      if (m < startDate.substring(0, 7)) cumulative += 1;
    });

    const sorted = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
    const chartData = sorted.map(([month, count]) => {
      cumulative += count;
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        'New Customers': count,
        'Total Customers': cumulative,
      };
    });

    const totalNew = sorted.reduce((s, [, c]) => s + c, 0);
    const totalBookingRevenue = bookings
      .filter(b => b.payment_status === 'paid' && b.scheduled_date >= startDate && b.scheduled_date <= endDate)
      .reduce((s, b) => s + (b.total_amount || 0), 0);
    const cac = totalNew > 0 ? Math.round(totalBookingRevenue * 0.1 / totalNew) : 0; // Estimated CAC

    return { chartData, stats: { totalNew, cac, cumulative } };
  }, [bookings, subscriptions, startDate, endDate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Customer Acquisition</CardTitle>
            <p className="text-sm text-slate-500">New customers per month and total growth</p>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-xs text-slate-400">New in Period</div>
              <div className="text-lg font-bold text-blue-600">{stats.totalNew}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Est. CAC</div>
              <div className="text-lg font-bold text-purple-600">AED {stats.cac}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Customers</div>
              <div className="text-lg font-bold text-slate-900">{stats.cumulative}</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-center py-16">No customer data in period</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="New Customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Area yAxisId="right" type="monotone" dataKey="Total Customers" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorTotal)" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}