import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, DollarSign } from 'lucide-react';

export default function AdminMetricsDashboard() {
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list(),
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list(),
  });

  // Calculate Monthly Recurring Revenue (MRR)
  const mrr = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.monthly_amount || 0), 0);
  }, [subscriptions]);

  // Calculate Booking Completion Rate
  const completionMetrics = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, rate };
  }, [bookings]);

  // Calculate Technician Utilization
  const utilizationMetrics = useMemo(() => {
    const activeBookings = bookings.filter(b => 
      ['en_route', 'in_progress', 'confirmed'].includes(b.status)
    ).length;
    const activeProviders = providers.filter(p => p.is_active).length;
    const utilization = activeProviders > 0 
      ? Math.round((activeBookings / activeProviders) * 100) 
      : 0;
    return { activeBookings, activeProviders, utilization };
  }, [bookings, providers]);

  // Revenue by Month (last 6 months simulation)
  const revenueByMonth = useMemo(() => {
    const monthData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthData[monthKey] = 0;
    }

    invoices.forEach(inv => {
      if (inv.status === 'paid' && inv.invoice_date) {
        const date = new Date(inv.invoice_date);
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthData[monthKey] !== undefined) {
          monthData[monthKey] += inv.total_amount || 0;
        }
      }
    });

    return Object.entries(monthData).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue)
    }));
  }, [invoices]);

  // Service Category Distribution
  const serviceDistribution = useMemo(() => {
    const dist = {};
    bookings.forEach(b => {
      const service = services.find(s => s.id === b.service_id);
      if (service) {
        dist[service.name] = (dist[service.name] || 0) + 1;
      }
    });

    return Object.entries(dist)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [bookings, services]);

  // Booking Status Distribution
  const statusDistribution = useMemo(() => {
    const dist = {};
    bookings.forEach(b => {
      dist[b.status] = (dist[b.status] || 0) + 1;
    });
    return Object.entries(dist).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [bookings]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Metrics Dashboard</h1>
          <p className="text-slate-600">Real-time performance indicators and analytics</p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* MRR Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Monthly Recurring Revenue</CardTitle>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">AED {mrr.toLocaleString()}</div>
              <p className="text-xs text-slate-500">{subscriptions.filter(s => s.status === 'active').length} active subscriptions</p>
            </CardContent>
          </Card>

          {/* Completion Rate Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{completionMetrics.rate}%</div>
              <p className="text-xs text-slate-500">{completionMetrics.completed} of {completionMetrics.total} bookings</p>
            </CardContent>
          </Card>

          {/* Technician Utilization Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Technician Utilization</CardTitle>
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{utilizationMetrics.utilization}%</div>
              <p className="text-xs text-slate-500">{utilizationMetrics.activeBookings} jobs / {utilizationMetrics.activeProviders} active techs</p>
            </CardContent>
          </Card>

          {/* Total Bookings Card */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Bookings</CardTitle>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{bookings.length}</div>
              <p className="text-xs text-slate-500">All-time bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Revenue Trend (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `AED ${value}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Top Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}