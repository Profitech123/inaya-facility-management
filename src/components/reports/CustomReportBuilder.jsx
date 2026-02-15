import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, FileText, Table, BarChart3 } from 'lucide-react';
import ExportButtons from './ExportButtons';

const METRIC_OPTIONS = [
  { id: 'bookings_count', label: 'Booking Count', category: 'Bookings' },
  { id: 'bookings_revenue', label: 'Booking Revenue', category: 'Bookings' },
  { id: 'bookings_avg_value', label: 'Avg Booking Value', category: 'Bookings' },
  { id: 'bookings_completion_rate', label: 'Completion Rate', category: 'Bookings' },
  { id: 'bookings_cancellation_rate', label: 'Cancellation Rate', category: 'Bookings' },
  { id: 'subs_active', label: 'Active Subscriptions', category: 'Subscriptions' },
  { id: 'subs_mrr', label: 'Monthly Recurring Revenue', category: 'Subscriptions' },
  { id: 'subs_churn', label: 'Churned Subscriptions', category: 'Subscriptions' },
  { id: 'tech_jobs', label: 'Jobs per Technician', category: 'Technicians' },
  { id: 'tech_avg_rating', label: 'Avg Technician Rating', category: 'Technicians' },
  { id: 'tech_utilization', label: 'Technician Utilization', category: 'Technicians' },
  { id: 'feedback_count', label: 'Review Count', category: 'Feedback' },
  { id: 'feedback_avg_rating', label: 'Avg Customer Rating', category: 'Feedback' },
  { id: 'feedback_satisfaction', label: 'Satisfaction Rate', category: 'Feedback' },
  { id: 'invoices_total', label: 'Total Invoiced', category: 'Revenue' },
  { id: 'invoices_paid', label: 'Paid Invoices', category: 'Revenue' },
  { id: 'invoices_overdue', label: 'Overdue Invoices', category: 'Revenue' },
];

const GROUP_BY_OPTIONS = [
  { id: 'month', label: 'By Month' },
  { id: 'service', label: 'By Service' },
  { id: 'technician', label: 'By Technician' },
  { id: 'status', label: 'By Status' },
];

function computeMetric(metricId, { bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate }) {
  const fb = bookings.filter(b => b.scheduled_date >= startDate && b.scheduled_date <= endDate);
  const fi = invoices.filter(i => (i.invoice_date || '') >= startDate && (i.invoice_date || '') <= endDate);
  const fr = reviews.filter(r => {
    const d = r.review_date || (r.created_date || '').substring(0, 10);
    return d >= startDate && d <= endDate;
  });

  switch (metricId) {
    case 'bookings_count': return fb.length;
    case 'bookings_revenue': return fb.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);
    case 'bookings_avg_value': return fb.length > 0 ? fb.reduce((s, b) => s + (b.total_amount || 0), 0) / fb.length : 0;
    case 'bookings_completion_rate': return fb.length > 0 ? (fb.filter(b => b.status === 'completed').length / fb.length * 100) : 0;
    case 'bookings_cancellation_rate': return fb.length > 0 ? (fb.filter(b => b.status === 'cancelled').length / fb.length * 100) : 0;
    case 'subs_active': return subscriptions.filter(s => s.status === 'active').length;
    case 'subs_mrr': return subscriptions.filter(s => s.status === 'active').reduce((s, sub) => s + (sub.monthly_amount || 0), 0);
    case 'subs_churn': return subscriptions.filter(s => s.status === 'cancelled' && s.cancelled_at && s.cancelled_at.substring(0, 10) >= startDate && s.cancelled_at.substring(0, 10) <= endDate).length;
    case 'tech_jobs': {
      const active = providers.filter(p => p.is_active);
      return active.length > 0 ? fb.filter(b => b.status === 'completed').length / active.length : 0;
    }
    case 'tech_avg_rating': {
      const rated = providers.filter(p => p.average_rating > 0);
      return rated.length > 0 ? rated.reduce((s, p) => s + p.average_rating, 0) / rated.length : 0;
    }
    case 'tech_utilization': {
      const active = providers.filter(p => p.is_active);
      const assigned = new Set(fb.map(b => b.assigned_provider_id).filter(Boolean));
      return active.length > 0 ? (assigned.size / active.length * 100) : 0;
    }
    case 'feedback_count': return fr.length;
    case 'feedback_avg_rating': return fr.length > 0 ? fr.reduce((s, r) => s + (r.rating || 0), 0) / fr.length : 0;
    case 'feedback_satisfaction': return fr.length > 0 ? (fr.filter(r => r.rating >= 4).length / fr.length * 100) : 0;
    case 'invoices_total': return fi.reduce((s, i) => s + (i.total_amount || 0), 0);
    case 'invoices_paid': return fi.filter(i => i.status === 'paid').length;
    case 'invoices_overdue': return fi.filter(i => i.status === 'overdue').length;
    default: return 0;
  }
}

function formatValue(metricId, value) {
  if (['bookings_revenue', 'bookings_avg_value', 'subs_mrr', 'invoices_total'].includes(metricId)) {
    return `AED ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (['bookings_completion_rate', 'bookings_cancellation_rate', 'feedback_satisfaction', 'tech_utilization'].includes(metricId)) {
    return `${Number(value).toFixed(1)}%`;
  }
  if (['feedback_avg_rating', 'tech_avg_rating', 'tech_jobs'].includes(metricId)) {
    return Number(value).toFixed(1);
  }
  return Number(value).toLocaleString();
}

function computeGrouped(metricId, groupBy, ctx) {
  const { bookings, providers, services, startDate, endDate } = ctx;
  const fb = bookings.filter(b => b.scheduled_date >= startDate && b.scheduled_date <= endDate);
  const results = [];

  if (groupBy === 'month') {
    const months = {};
    fb.forEach(b => {
      const m = b.scheduled_date.substring(0, 7);
      if (!months[m]) months[m] = [];
      months[m].push(b);
    });
    Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).forEach(([m, mBookings]) => {
      const subCtx = { ...ctx, bookings: mBookings, startDate, endDate };
      results.push({
        label: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: computeMetric(metricId, subCtx)
      });
    });
  } else if (groupBy === 'service') {
    const svcMap = {};
    fb.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      if (!svcMap[name]) svcMap[name] = [];
      svcMap[name].push(b);
    });
    Object.entries(svcMap).forEach(([name, sBookings]) => {
      const subCtx = { ...ctx, bookings: sBookings };
      results.push({
        label: name.length > 16 ? name.substring(0, 16) + '…' : name,
        value: computeMetric(metricId, subCtx)
      });
    });
    results.sort((a, b) => b.value - a.value);
  } else if (groupBy === 'technician') {
    const techMap = {};
    fb.forEach(b => {
      if (b.assigned_provider_id) {
        if (!techMap[b.assigned_provider_id]) techMap[b.assigned_provider_id] = [];
        techMap[b.assigned_provider_id].push(b);
      }
    });
    Object.entries(techMap).forEach(([id, tBookings]) => {
      const prov = providers.find(p => p.id === id);
      const name = prov?.full_name || 'Unknown';
      const subCtx = { ...ctx, bookings: tBookings };
      results.push({
        label: name.length > 14 ? name.substring(0, 14) + '…' : name,
        value: computeMetric(metricId, subCtx)
      });
    });
    results.sort((a, b) => b.value - a.value);
  } else if (groupBy === 'status') {
    const statusMap = {};
    fb.forEach(b => {
      if (!statusMap[b.status]) statusMap[b.status] = [];
      statusMap[b.status].push(b);
    });
    Object.entries(statusMap).forEach(([status, sBookings]) => {
      const subCtx = { ...ctx, bookings: sBookings };
      results.push({ label: status, value: computeMetric(metricId, subCtx) });
    });
  }

  return results;
}

export default function CustomReportBuilder({ bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['bookings_count', 'bookings_revenue', 'feedback_avg_rating']);
  const [groupBy, setGroupBy] = useState('month');
  const [viewMode, setViewMode] = useState('chart');

  const ctx = { bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate };

  const toggleMetric = (id) => {
    setSelectedMetrics(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const categories = [...new Set(METRIC_OPTIONS.map(m => m.category))];

  // Summary values
  const summaryValues = useMemo(() => {
    return selectedMetrics.map(id => {
      const opt = METRIC_OPTIONS.find(m => m.id === id);
      return { id, label: opt?.label || id, value: computeMetric(id, ctx) };
    });
  }, [selectedMetrics, bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate]);

  // Grouped data for first selected metric (chart)
  const chartMetric = selectedMetrics[0];
  const chartLabel = METRIC_OPTIONS.find(m => m.id === chartMetric)?.label || '';
  const groupedData = useMemo(() => {
    if (!chartMetric) return [];
    return computeGrouped(chartMetric, groupBy, ctx);
  }, [chartMetric, groupBy, bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate]);

  // Build export data
  const exportHeaders = ['Metric', 'Value'];
  const exportRows = summaryValues.map(sv => [sv.label, formatValue(sv.id, sv.value)]);
  const groupedExportHeaders = ['Group', ...selectedMetrics.map(id => METRIC_OPTIONS.find(m => m.id === id)?.label || id)];
  const groupedExportRows = useMemo(() => {
    if (!groupBy) return [];
    const firstGrouped = chartMetric ? computeGrouped(chartMetric, groupBy, ctx) : [];
    return firstGrouped.map(g => {
      const row = [g.label];
      selectedMetrics.forEach(metricId => {
        const grouped = computeGrouped(metricId, groupBy, ctx);
        const match = grouped.find(gg => gg.label === g.label);
        row.push(formatValue(metricId, match?.value || 0));
      });
      return row;
    });
  }, [selectedMetrics, groupBy, bookings, subscriptions, invoices, providers, reviews, services, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Build Your Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">Select the metrics you want to include in your custom report:</p>
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {METRIC_OPTIONS.filter(m => m.category === cat).map(m => (
                  <Badge
                    key={m.id}
                    variant={selectedMetrics.includes(m.id) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${selectedMetrics.includes(m.id) ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-slate-100'}`}
                    onClick={() => toggleMetric(m.id)}
                  >
                    {m.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                {GROUP_BY_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">View</label>
              <div className="flex gap-1">
                <Button size="sm" variant={viewMode === 'chart' ? 'default' : 'outline'} className="h-8" onClick={() => setViewMode('chart')}>
                  <BarChart3 className="w-3.5 h-3.5 mr-1" /> Chart
                </Button>
                <Button size="sm" variant={viewMode === 'table' ? 'default' : 'outline'} className="h-8" onClick={() => setViewMode('table')}>
                  <Table className="w-3.5 h-3.5 mr-1" /> Table
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedMetrics.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>Select at least one metric above to generate your report</p>
          </CardContent>
        </Card>
      )}

      {/* Summary KPI Cards */}
      {selectedMetrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryValues.map(sv => (
            <Card key={sv.id}>
              <CardContent className="pt-5 pb-4">
                <span className="text-xs text-slate-500 font-medium block mb-1">{sv.label}</span>
                <div className="text-2xl font-bold text-slate-900">{formatValue(sv.id, sv.value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chart or Table */}
      {selectedMetrics.length > 0 && groupedData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{chartLabel} — {GROUP_BY_OPTIONS.find(o => o.id === groupBy)?.label}</CardTitle>
            <ExportButtons
              title="Custom_Report"
              headers={groupedExportHeaders}
              rows={groupedExportRows}
            />
          </CardHeader>
          <CardContent>
            {viewMode === 'chart' ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={groupedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => [formatValue(chartMetric, v), chartLabel]} />
                  <Bar dataKey="value" fill="#10b981" name={chartLabel} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 font-medium text-slate-600">Group</th>
                      {selectedMetrics.map(id => (
                        <th key={id} className="text-right p-3 font-medium text-slate-600">
                          {METRIC_OPTIONS.find(m => m.id === id)?.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedExportRows.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        {row.map((cell, ci) => (
                          <td key={ci} className={`p-3 ${ci > 0 ? 'text-right font-medium' : ''}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Summary Export */}
      {selectedMetrics.length > 0 && (
        <div className="flex justify-end">
          <ExportButtons title="Custom_Report_Summary" headers={exportHeaders} rows={exportRows} />
        </div>
      )}
    </div>
  );
}