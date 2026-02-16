import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { FileText, TrendingUp, Users, Star, Download } from 'lucide-react';
import moment from 'moment';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminReportingSummary({ bookings, services, providers, subscriptions }) {
  const [period, setPeriod] = useState('30');

  const cutoff = moment().subtract(parseInt(period), 'days').startOf('day');

  const periodBookings = bookings.filter(b => moment(b.created_date).isAfter(cutoff));
  const completedInPeriod = periodBookings.filter(b => b.status === 'completed');
  const revenueInPeriod = completedInPeriod.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  // Service request summary
  const serviceBreakdown = useMemo(() => {
    const counts = {};
    periodBookings.forEach(b => {
      const svc = services.find(s => s.id === b.service_id);
      const name = svc?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [periodBookings, services]);

  // Provider performance
  const providerPerf = useMemo(() => {
    return providers.map(p => {
      const jobs = periodBookings.filter(b => b.assigned_provider_id === p.id);
      const completed = jobs.filter(b => b.status === 'completed');
      const earned = completed.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const delayed = jobs.filter(b => b.status === 'delayed').length;
      return {
        name: p.full_name?.split(' ')[0] || 'N/A',
        full_name: p.full_name,
        completed: completed.length,
        earned,
        delayed,
        rating: p.average_rating || 0,
        total: jobs.length,
      };
    }).filter(p => p.total > 0).sort((a, b) => b.completed - a.completed);
  }, [periodBookings, providers]);

  // Daily revenue trend
  const dailyRevenue = useMemo(() => {
    const days = {};
    const dayCount = parseInt(period);
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = moment().subtract(i, 'days').format('MMM D');
      days[d] = 0;
    }
    completedInPeriod.forEach(b => {
      const d = moment(b.completed_at || b.scheduled_date).format('MMM D');
      if (days[d] !== undefined) days[d] += (b.total_amount || 0);
    });
    // Show max 14 data points for readability
    const entries = Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
    if (entries.length > 14) {
      const step = Math.ceil(entries.length / 14);
      return entries.filter((_, i) => i % step === 0 || i === entries.length - 1);
    }
    return entries;
  }, [completedInPeriod, period]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts = {};
    periodBookings.forEach(b => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [periodBookings]);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> Reporting Summary
        </h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-slate-900">{periodBookings.length}</p>
            <p className="text-xs text-slate-400">{completedInPeriod.length} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">AED {revenueInPeriod.toLocaleString()}</p>
            <p className="text-xs text-slate-400">from completed jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Active Providers</p>
            <p className="text-2xl font-bold text-blue-600">{providerPerf.length}</p>
            <p className="text-xs text-slate-400">with jobs in period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Avg Job Value</p>
            <p className="text-2xl font-bold text-purple-600">
              AED {completedInPeriod.length > 0 ? Math.round(revenueInPeriod / completedInPeriod.length) : 0}
            </p>
            <p className="text-xs text-slate-400">per completed job</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`AED ${val}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Requests Breakdown */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Requests by Service</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceBreakdown} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Provider Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providerPerf.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No provider data for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Provider</th>
                    <th className="p-3 text-center text-xs font-semibold text-slate-600">Jobs</th>
                    <th className="p-3 text-center text-xs font-semibold text-slate-600">Completed</th>
                    <th className="p-3 text-center text-xs font-semibold text-slate-600">Delayed</th>
                    <th className="p-3 text-center text-xs font-semibold text-slate-600">Rating</th>
                    <th className="p-3 text-right text-xs font-semibold text-slate-600">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {providerPerf.map((p, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-3 font-medium text-slate-900">{p.full_name}</td>
                      <td className="p-3 text-center text-slate-600">{p.total}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">{p.completed}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        {p.delayed > 0 ? <Badge className="bg-red-100 text-red-700 text-xs">{p.delayed}</Badge> : <span className="text-slate-300">0</span>}
                      </td>
                      <td className="p-3 text-center">
                        <span className="flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          {p.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium text-slate-900">AED {p.earned.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {statusBreakdown.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize text-slate-700">{s.name}</span>
                    <span className="ml-auto font-medium text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings by Provider */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Earnings by Provider</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerPerf.slice(0, 6)}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val) => [`AED ${val}`, 'Earnings']} />
                  <Bar dataKey="earned" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}