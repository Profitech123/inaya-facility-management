import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, TrendingUp, Star, AlertCircle } from 'lucide-react';

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

  // Revenue calculations
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const monthlyRevenue = invoices.filter(i => {
    const invoiceMonth = new Date(i.invoice_date).getMonth();
    const currentMonth = new Date().getMonth();
    return i.status === 'paid' && invoiceMonth === currentMonth;
  }).reduce((sum, i) => sum + i.total_amount, 0);

  // Booking stats
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  // Support stats
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const avgResolutionTime = 24; // Mock - would calculate from actual data

  // Provider performance
  const avgProviderRating = providers.reduce((sum, p) => sum + p.average_rating, 0) / (providers.length || 1);
  const topProviders = [...providers].sort((a, b) => b.average_rating - a.average_rating).slice(0, 5);

  // Customer satisfaction
  const avgCustomerRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-slate-300">Business insights and performance metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Revenue Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Revenue Overview</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">AED {totalRevenue.toFixed(0)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">AED {monthlyRevenue.toFixed(0)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Subscriptions</CardTitle>
                <Users className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{activeSubscriptions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Customer Rating</CardTitle>
                <Star className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{avgCustomerRating.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Operations Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Operations</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Bookings</CardTitle>
                <Calendar className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{bookings.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                <Calendar className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                <Calendar className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{pendingBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Open Tickets</CardTitle>
                <AlertCircle className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{openTickets}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Providers */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Top Performing Providers</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topProviders.map((provider, idx) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-lg font-bold text-emerald-600">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{provider.full_name}</div>
                        <div className="text-sm text-slate-500">{provider.total_jobs_completed} jobs completed</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold">{provider.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
                {topProviders.length === 0 && (
                  <div className="text-center py-8 text-slate-500">No provider data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}