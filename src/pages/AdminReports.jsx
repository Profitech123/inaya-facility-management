import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, Calendar, TrendingUp, Star, AlertCircle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list(),
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: []
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['allInvoices'],
    queryFn: () => base44.entities.Invoice.list(),
    initialData: []
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: []
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => base44.entities.SupportTicket.list(),
    initialData: []
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.ProviderReview.list(),
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: []
  });

  const analytics = useMemo(() => {
    // Revenue calculations
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
    const monthlyRevenue = invoices.filter(i => {
      const invoiceMonth = new Date(i.invoice_date).getMonth();
      const currentMonth = new Date().getMonth();
      return i.status === 'paid' && invoiceMonth === currentMonth;
    }).reduce((sum, i) => sum + i.total_amount, 0);

    // Revenue trends - last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyRevenue = last30Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: invoices
        .filter(i => i.status === 'paid' && i.invoice_date === date)
        .reduce((sum, i) => sum + i.total_amount, 0)
    }));

    // Booking status breakdown
    const bookingStatusData = [
      { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: '#10b981' },
      { name: 'In Progress', value: bookings.filter(b => b.status === 'in_progress').length, color: '#8b5cf6' },
      { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#3b82f6' },
      { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: '#f59e0b' },
      { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Subscription growth - last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return { month: date.toLocaleDateString('en-US', { month: 'short' }), year: date.getFullYear(), monthNum: date.getMonth() };
    });

    const subscriptionGrowth = last6Months.map(({ month, monthNum }) => ({
      month,
      active: subscriptions.filter(s => {
        const startMonth = new Date(s.start_date).getMonth();
        return s.status === 'active' && startMonth <= monthNum;
      }).length,
      cancelled: subscriptions.filter(s => {
        const cancelMonth = s.end_date ? new Date(s.end_date).getMonth() : -1;
        return cancelMonth === monthNum;
      }).length
    }));

    // Provider performance
    const avgProviderRating = providers.reduce((sum, p) => sum + p.average_rating, 0) / (providers.length || 1);
    const topProviders = [...providers].sort((a, b) => b.average_rating - a.average_rating).slice(0, 5);
    
    const providerCompletionRate = providers.map(p => ({
      name: p.full_name,
      completed: p.total_jobs_completed,
      rating: p.average_rating
    })).sort((a, b) => b.completed - a.completed).slice(0, 8);

    // Support ticket analytics
    const ticketsByCategory = [
      { category: 'Billing', count: tickets.filter(t => t.category === 'billing').length },
      { category: 'Service Quality', count: tickets.filter(t => t.category === 'service_quality').length },
      { category: 'Scheduling', count: tickets.filter(t => t.category === 'scheduling').length },
      { category: 'Technical', count: tickets.filter(t => t.category === 'technical').length },
      { category: 'General', count: tickets.filter(t => t.category === 'general').length }
    ].filter(item => item.count > 0);

    const avgResolutionTime = tickets
      .filter(t => t.resolved_at)
      .reduce((sum, t) => {
        const created = new Date(t.created_date).getTime();
        const resolved = new Date(t.resolved_at).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0) / (tickets.filter(t => t.resolved_at).length || 1);

    // Service popularity
    const serviceBookings = services.map(service => ({
      name: service.name,
      bookings: bookings.filter(b => b.service_id === service.id).length
    })).filter(s => s.bookings > 0).sort((a, b) => b.bookings - a.bookings).slice(0, 10);

    // Area demand
    const areaDemand = properties.reduce((acc, prop) => {
      const area = prop.area || 'Unknown';
      acc[area] = (acc[area] || 0) + bookings.filter(b => b.property_id === prop.id).length;
      return acc;
    }, {});

    const areaDemandData = Object.entries(areaDemand)
      .map(([area, count]) => ({ area, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    return {
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      bookingStatusData,
      subscriptionGrowth,
      avgProviderRating,
      topProviders,
      providerCompletionRate,
      ticketsByCategory,
      avgResolutionTime,
      serviceBookings,
      areaDemandData,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      avgCustomerRating: reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
    };
  }, [bookings, subscriptions, invoices, providers, tickets, reviews, services, properties]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-slate-300">Business insights and performance metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* KPI Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">AED {analytics.totalRevenue.toFixed(0)}</div>
              <p className="text-xs text-slate-500 mt-1">AED {analytics.monthlyRevenue.toFixed(0)} this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bookings</CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{bookings.length}</div>
              <p className="text-xs text-slate-500 mt-1">{analytics.completedBookings} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Subscriptions</CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{analytics.activeSubscriptions}</div>
              <p className="text-xs text-slate-500 mt-1">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Satisfaction</CardTitle>
              <Star className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{analytics.avgCustomerRating.toFixed(1)}</div>
              <p className="text-xs text-slate-500 mt-1">Average rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analytics.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (AED)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={analytics.bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {analytics.bookingStatusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Services by Demand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.serviceBookings.slice(0, 8).map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-xs font-bold text-emerald-600">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium">{service.name}</span>
                        </div>
                        <span className="text-sm text-slate-600">{service.bookings} bookings</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Area Demand Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.areaDemandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Growth & Churn (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analytics.subscriptionGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" fill="#10b981" name="Active" />
                    <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Completion Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analytics.providerCompletionRate} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#8b5cf6" name="Jobs Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topProviders.map((provider, idx) => (
                      <div key={provider.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-600">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{provider.full_name}</div>
                            <div className="text-xs text-slate-500">{provider.total_jobs_completed} jobs</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{provider.average_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tickets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.ticketsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" name="Tickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Avg Resolution Time</span>
                      <Activity className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{analytics.avgResolutionTime.toFixed(1)}h</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Open Tickets</span>
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-bold text-red-600">{analytics.openTickets}</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Total Tickets</span>
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{tickets.length}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}