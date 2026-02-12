import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import ExportButtons from './ExportButtons';

export default function SystemHealthReport({ bookings, subscriptions, tickets, invoices, providers, startDate, endDate }) {
  const data = useMemo(() => {
    // Entity counts as proxy for "API usage"
    const entityCounts = [
      { entity: 'Bookings', count: bookings.length },
      { entity: 'Subscriptions', count: subscriptions.length },
      { entity: 'Invoices', count: invoices.length },
      { entity: 'Providers', count: providers.length },
      { entity: 'Support Tickets', count: tickets.length },
    ];

    // Activity by day (bookings + subscriptions created in period)
    const activityMap = {};
    [...bookings, ...subscriptions, ...invoices].forEach(item => {
      const d = (item.created_date || '').substring(0, 10);
      if (d >= startDate && d <= endDate) {
        activityMap[d] = (activityMap[d] || 0) + 1;
      }
    });
    const dailyActivity = Object.entries(activityMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actions: count
      }));

    // Support ticket resolution metrics
    const periodTickets = tickets.filter(t => {
      const d = (t.created_date || '').substring(0, 10);
      return d >= startDate && d <= endDate;
    });
    const openTickets = periodTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const resolvedTickets = periodTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const resolutionRate = periodTickets.length > 0 ? (resolvedTickets / periodTickets.length * 100) : 100;

    // Ticket priority breakdown
    const priorityMap = {};
    periodTickets.forEach(t => {
      priorityMap[t.priority || 'medium'] = (priorityMap[t.priority || 'medium'] || 0) + 1;
    });
    const priorityData = Object.entries(priorityMap)
      .map(([priority, count]) => ({ priority, count }));

    // Data volume overview
    const totalRecords = entityCounts.reduce((s, e) => s + e.count, 0);

    // Error/issue indicators
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
    const cancelledBookings = bookings.filter(b => 
      b.status === 'cancelled' && b.scheduled_date >= startDate && b.scheduled_date <= endDate
    ).length;
    const urgentTickets = periodTickets.filter(t => t.priority === 'urgent' && (t.status === 'open' || t.status === 'in_progress')).length;

    const exportRows = [
      ['Total Records', totalRecords],
      ['Open Tickets', openTickets],
      ['Resolution Rate', `${resolutionRate.toFixed(1)}%`],
      ['Overdue Invoices', overdueInvoices],
      ['Cancelled Bookings (period)', cancelledBookings],
      ['Urgent Open Tickets', urgentTickets],
      ...entityCounts.map(e => [e.entity, e.count]),
    ];

    return {
      entityCounts, dailyActivity, openTickets, resolvedTickets, resolutionRate,
      priorityData, totalRecords, overdueInvoices, cancelledBookings, urgentTickets, exportRows
    };
  }, [bookings, subscriptions, tickets, invoices, providers, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Database, label: 'Total Records', value: data.totalRecords.toLocaleString(), color: 'text-slate-900' },
          { icon: CheckCircle, label: 'Ticket Resolution', value: `${data.resolutionRate.toFixed(0)}%`, color: data.resolutionRate >= 80 ? 'text-emerald-600' : 'text-red-600' },
          { icon: AlertTriangle, label: 'Overdue Invoices', value: data.overdueInvoices, color: data.overdueInvoices > 0 ? 'text-red-600' : 'text-green-600' },
          { icon: Activity, label: 'Urgent Tickets', value: data.urgentTickets, color: data.urgentTickets > 0 ? 'text-red-600' : 'text-green-600' },
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily System Activity</CardTitle>
          <ExportButtons title="System_Activity" headers={['Date', 'Actions']} rows={data.dailyActivity.map(r => [r.date, r.actions])} />
        </CardHeader>
        <CardContent>
          {data.dailyActivity.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No activity in selected period</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="actions" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Data Volume by Entity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.entityCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="entity" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Records" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Issue Indicators</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Open Support Tickets', value: data.openTickets, ok: data.openTickets === 0 },
              { label: 'Urgent Open Tickets', value: data.urgentTickets, ok: data.urgentTickets === 0 },
              { label: 'Overdue Invoices', value: data.overdueInvoices, ok: data.overdueInvoices === 0 },
              { label: 'Cancelled Bookings (period)', value: data.cancelledBookings, ok: data.cancelledBookings < 5 },
              { label: 'Ticket Resolution Rate', value: `${data.resolutionRate.toFixed(1)}%`, ok: data.resolutionRate >= 80 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${item.ok ? 'text-emerald-600' : 'text-red-600'}`}>{item.value}</span>
                  {item.ok ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <ExportButtons title="System_Health" headers={['Metric', 'Value']} rows={data.exportRows} />
      </div>
    </div>
  );
}