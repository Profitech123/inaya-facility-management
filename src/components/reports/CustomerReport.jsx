import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import ExportButtons from './ExportButtons';

export default function CustomerReport({ subscriptions, bookings, startDate, endDate }) {
  const data = useMemo(() => {
    // Unique customers = unique customer_ids across bookings + subscriptions
    const allCustomerIds = new Set([
      ...bookings.map(b => b.customer_id),
      ...subscriptions.map(s => s.customer_id)
    ]);
    const totalCustomers = allCustomerIds.size;

    // Active customers in period (had a booking or active subscription)
    const activeCustomerIds = new Set([
      ...bookings.filter(b => b.scheduled_date >= startDate && b.scheduled_date <= endDate).map(b => b.customer_id),
      ...subscriptions.filter(s => s.status === 'active').map(s => s.customer_id)
    ]);
    const activeCustomers = activeCustomerIds.size;

    // Acquisition by month (first appearance of customer_id)
    const firstSeen = {};
    [...bookings, ...subscriptions]
      .sort((a, b) => (a.created_date || '').localeCompare(b.created_date || ''))
      .forEach(item => {
        const cid = item.customer_id;
        if (!firstSeen[cid] && item.created_date) {
          firstSeen[cid] = item.created_date.substring(0, 7);
        }
      });
    const acqMap = {};
    Object.values(firstSeen).forEach(m => {
      if (m >= startDate.substring(0, 7) && m <= endDate.substring(0, 7)) {
        acqMap[m] = (acqMap[m] || 0) + 1;
      }
    });
    const acquisitionOverTime = Object.entries(acqMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        newCustomers: count
      }));

    // Churn = cancelled subscriptions in period
    const churnedInPeriod = subscriptions.filter(s =>
      s.status === 'cancelled' && s.cancelled_at &&
      s.cancelled_at.substring(0, 10) >= startDate && s.cancelled_at.substring(0, 10) <= endDate
    );
    const churnCount = churnedInPeriod.length;
    const activeSubCount = subscriptions.filter(s => s.status === 'active').length;
    const churnRate = activeSubCount > 0 ? ((churnCount / (activeSubCount + churnCount)) * 100) : 0;

    // Churn over time
    const churnMap = {};
    churnedInPeriod.forEach(s => {
      const m = s.cancelled_at.substring(0, 7);
      churnMap[m] = (churnMap[m] || 0) + 1;
    });
    const churnOverTime = Object.entries(churnMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        churned: count
      }));

    // Top customers by spend
    const spendMap = {};
    bookings.filter(b => b.payment_status === 'paid' && b.scheduled_date >= startDate && b.scheduled_date <= endDate).forEach(b => {
      spendMap[b.customer_id] = (spendMap[b.customer_id] || 0) + (b.total_amount || 0);
    });
    const topCustomers = Object.entries(spendMap)
      .map(([id, spend]) => ({ id: id.slice(0, 8), spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    const exportRows = [
      ['Total Customers', totalCustomers],
      ['Active Customers', activeCustomers],
      ['Churned (period)', churnCount],
      ['Churn Rate', `${churnRate.toFixed(1)}%`],
    ];

    return { totalCustomers, activeCustomers, churnCount, churnRate, acquisitionOverTime, churnOverTime, topCustomers, exportRows };
  }, [subscriptions, bookings, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Customers', value: data.totalCustomers, color: 'text-slate-900' },
          { icon: Users, label: 'Active Customers', value: data.activeCustomers, color: 'text-emerald-600' },
          { icon: UserPlus, label: 'New (Period)', value: data.acquisitionOverTime.reduce((s, r) => s + r.newCustomers, 0), color: 'text-blue-600' },
          { icon: UserMinus, label: 'Churn Rate', value: `${data.churnRate.toFixed(1)}%`, color: data.churnRate > 10 ? 'text-red-600' : 'text-green-600' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">{kpi.label}</span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Acquisition</CardTitle>
            <ExportButtons title="Customer_Acquisition" headers={['Month', 'New Customers']} rows={data.acquisitionOverTime.map(r => [r.month, r.newCustomers])} />
          </CardHeader>
          <CardContent>
            {data.acquisitionOverTime.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No acquisition data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.acquisitionOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="newCustomers" fill="#3b82f6" name="New Customers" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Churn</CardTitle>
            <ExportButtons title="Customer_Churn" headers={['Month', 'Churned']} rows={data.churnOverTime.map(r => [r.month, r.churned])} />
          </CardHeader>
          <CardContent>
            {data.churnOverTime.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No churn in period</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.churnOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="churned" fill="#ef4444" name="Churned" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Customers by Spend</CardTitle>
          <ExportButtons title="Top_Customers" headers={['Customer ID', 'Total Spend (AED)']} rows={data.topCustomers.map(c => [c.id, c.spend.toFixed(2)])} />
        </CardHeader>
        <CardContent>
          {data.topCustomers.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No customer spend data</p>
          ) : (
            <div className="space-y-2">
              {data.topCustomers.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700">Customer #{c.id}</span>
                  </div>
                  <span className="font-semibold text-slate-900">AED {c.spend.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}