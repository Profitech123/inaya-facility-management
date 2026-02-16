import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Banknote, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

export default function ProviderEarnings({ bookings, services }) {
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const stats = useMemo(() => {
    const total = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const thisMonth = completedBookings.filter(b =>
      moment(b.completed_at || b.scheduled_date).isSame(moment(), 'month')
    );
    const thisMonthTotal = thisMonth.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const lastMonth = completedBookings.filter(b =>
      moment(b.completed_at || b.scheduled_date).isSame(moment().subtract(1, 'month'), 'month')
    );
    const lastMonthTotal = lastMonth.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    return { total, thisMonthTotal, lastMonthTotal, thisMonthJobs: thisMonth.length, totalJobs: completedBookings.length };
  }, [completedBookings]);

  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, 'months');
      const monthBookings = completedBookings.filter(b =>
        moment(b.completed_at || b.scheduled_date).isSame(m, 'month')
      );
      months.push({
        month: m.format('MMM'),
        earnings: monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        jobs: monthBookings.length,
      });
    }
    return months;
  }, [completedBookings]);

  const recentPayments = completedBookings
    .sort((a, b) => new Date(b.completed_at || b.scheduled_date) - new Date(a.completed_at || a.scheduled_date))
    .slice(0, 8);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `AED ${stats.total.toLocaleString()}`, icon: Banknote, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'This Month', value: `AED ${stats.thisMonthTotal.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'Jobs This Month', value: stats.thisMonthJobs, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Jobs', value: stats.totalJobs, icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${kpi.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Earnings Overview (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`AED ${val}`, 'Earnings']} />
                <Bar dataKey="earnings" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No completed jobs yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((b) => {
                const service = services.find(s => s.id === b.service_id);
                return (
                  <div key={b.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{service?.name || 'Service'}</p>
                      <p className="text-xs text-slate-400">
                        {moment(b.completed_at || b.scheduled_date).format('MMM D, YYYY')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-700">AED {b.total_amount}</p>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">
                        {b.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}