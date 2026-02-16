import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Repeat } from 'lucide-react';
import ExportButtons from './ExportButtons';

export default function RevenueReport({ invoices, subscriptions, packages, bookings, services, startDate, endDate }) {
  const data = useMemo(() => {
    const filtered = invoices.filter(i => {
      if (!i.invoice_date) return false;
      return i.invoice_date >= startDate && i.invoice_date <= endDate;
    });

    const paid = filtered.filter(i => i.status === 'paid');
    const totalRevenue = paid.reduce((s, i) => s + (i.total_amount || 0), 0);

    // MRR from active subscriptions
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const mrr = activeSubs.reduce((s, sub) => s + (sub.monthly_amount || 0), 0);

    // Revenue over time (grouped by month)
    const monthMap = {};
    paid.forEach(inv => {
      const m = inv.invoice_date.substring(0, 7); // YYYY-MM
      monthMap[m] = (monthMap[m] || 0) + (inv.total_amount || 0);
    });
    const revenueOverTime = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: amount
      }));

    // Revenue by package
    const pkgMap = {};
    filtered.forEach(inv => {
      if (inv.subscription_id) {
        const sub = subscriptions.find(s => s.id === inv.subscription_id);
        const pkg = sub ? packages.find(p => p.id === sub.package_id) : null;
        const name = pkg?.name || 'One-Off';
        pkgMap[name] = (pkgMap[name] || 0) + (inv.total_amount || 0);
      } else {
        pkgMap['One-Off Booking'] = (pkgMap['One-Off Booking'] || 0) + (inv.total_amount || 0);
      }
    });
    const revenueByPackage = Object.entries(pkgMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Revenue by service
    const svcMap = {};
    bookings.forEach(b => {
      if (b.scheduled_date >= startDate && b.scheduled_date <= endDate && b.payment_status === 'paid') {
        const svc = services.find(s => s.id === b.service_id);
        const name = svc?.name || 'Unknown';
        svcMap[name] = (svcMap[name] || 0) + (b.total_amount || 0);
      }
    });
    const revenueByService = Object.entries(svcMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Average invoice value
    const avgInvoice = paid.length > 0 ? totalRevenue / paid.length : 0;

    // Export rows
    const exportRows = paid.map(i => [i.invoice_number, i.invoice_date, i.status, i.total_amount?.toFixed(2), i.payment_method || '']);

    return { totalRevenue, mrr, revenueOverTime, revenueByPackage, revenueByService, avgInvoice, totalInvoices: paid.length, exportRows };
  }, [invoices, subscriptions, packages, bookings, services, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: `AED ${data.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-emerald-600' },
          { icon: Repeat, label: 'Monthly Recurring (MRR)', value: `AED ${data.mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-blue-600' },
          { icon: TrendingUp, label: 'Avg Invoice Value', value: `AED ${data.avgInvoice.toFixed(0)}`, color: 'text-purple-600' },
          { icon: DollarSign, label: 'Paid Invoices', value: data.totalInvoices, color: 'text-slate-900' },
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

      {/* Revenue Over Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Over Time</CardTitle>
          <ExportButtons title="Revenue_Over_Time" headers={['Month', 'Revenue (AED)']} rows={data.revenueOverTime.map(r => [r.month, r.revenue.toFixed(2)])} />
        </CardHeader>
        <CardContent>
          {data.revenueOverTime.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No revenue data in selected period</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => [`AED ${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Package & Service */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue by Package</CardTitle>
            <ExportButtons title="Revenue_By_Package" headers={['Package', 'Revenue (AED)']} rows={data.revenueByPackage.map(r => [r.name, r.amount.toFixed(2)])} />
          </CardHeader>
          <CardContent>
            {data.revenueByPackage.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.revenueByPackage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`AED ${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue by Service</CardTitle>
            <ExportButtons title="Revenue_By_Service" headers={['Service', 'Revenue (AED)']} rows={data.revenueByService.map(r => [r.name, r.amount.toFixed(2)])} />
          </CardHeader>
          <CardContent>
            {data.revenueByService.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.revenueByService} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`AED ${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Export */}
      <div className="flex justify-end">
        <ExportButtons title="All_Invoices" headers={['Invoice #', 'Date', 'Status', 'Amount (AED)', 'Payment Method']} rows={data.exportRows} />
      </div>
    </div>
  );
}