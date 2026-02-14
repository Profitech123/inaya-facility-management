import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Package, DollarSign, Users, TrendingUp, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import AuthGuard from '@/components/AuthGuard';
import AIFeedbackSummarizer from '../components/admin/AIFeedbackSummarizer';
import AdminNotifications from '../components/admin/AdminNotifications';
import DashboardBookingTrends from '../components/admin/DashboardBookingTrends';
import DashboardRevenueByService from '../components/admin/DashboardRevenueByService';
import DashboardMiniSubscriptions from '../components/admin/DashboardMiniSubscriptions';
import DashboardTechPerformance from '../components/admin/DashboardTechPerformance';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import OnboardingTooltip from '../components/onboarding/OnboardingTooltip';

function AdminDashboardContent() {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;
    clientAuth.me()
      .then(u => {
        if (mounted) {
          setUser(u);
          setIsLoadingUser(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoadingUser(false);
      });
    return () => { mounted = false; };
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 200),
    enabled: !isLoadingUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    enabled: !isLoadingUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    enabled: !isLoadingUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    enabled: !isLoadingUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['adminReviews'],
    queryFn: () => base44.entities.ProviderReview.list('-created_date', 50),
    enabled: !isLoadingUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 50),
    enabled: !isLoadingUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0);
  const monthlyRecurring = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthly_amount, 0);
  const uniqueCustomers = new Set([...bookings.map(b => b.customer_id), ...subscriptions.map(s => s.customer_id)]).size;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;
  const avgBookingValue = bookings.filter(b => b.payment_status === 'paid').length > 0
    ? Math.round(totalRevenue / bookings.filter(b => b.payment_status === 'paid').length)
    : 0;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString()}`, sub: 'From paid bookings', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Monthly Recurring', value: `AED ${monthlyRecurring.toLocaleString()}`, sub: `${subscriptions.filter(s => s.status === 'active').length} active subs`, icon: Repeat, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: bookings.length, sub: `${bookings.filter(b => b.status === 'pending').length} pending`, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Customers', value: uniqueCustomers, sub: `${completedJobs} jobs done`, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Services', value: services.length, sub: `${services.filter(s => s.is_active).length} active`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Avg Booking', value: `AED ${avgBookingValue}`, sub: 'Per paid booking', icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Business overview and critical alerts</p>
        </div>

        {/* Onboarding Checklist */}
        <div className="mb-8">
          <OnboardingChecklist userRole="admin" />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                  <span className="text-[11px] text-slate-400">{kpi.sub}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notifications / Alerts */}
        <div className="mb-8">
          <AdminNotifications
            bookings={bookings}
            subscriptions={subscriptions}
            tickets={tickets}
            providers={providers}
          />
        </div>

        {/* Charts Row 1: Booking Trends + Revenue by Service */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <DashboardBookingTrends bookings={bookings} />
          <DashboardRevenueByService bookings={bookings} services={services} />
        </div>

        {/* Charts Row 2: Subscription Growth + Tech Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <DashboardMiniSubscriptions subscriptions={subscriptions} />
          <DashboardTechPerformance providers={providers} bookings={bookings} reviews={reviews} />
        </div>

        {/* AI Feedback Summary */}
        <div className="mb-8">
          <AIFeedbackSummarizer reviews={reviews} tickets={tickets} bookings={bookings} />
        </div>

        {/* Quick Actions + Recent Bookings */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: 'Manage Services', page: 'AdminServices' },
                { label: 'View Bookings', page: 'AdminBookings' },
                { label: 'Subscriptions', page: 'AdminSubscriptions' },
                { label: 'Tech Schedules', page: 'AdminTechSchedule' },
                { label: 'Technicians', page: 'AdminTechnicians' },
                { label: 'Support Tickets', page: 'AdminSupport' },
                { label: 'Live Chat', page: 'AdminLiveChat' },
                { label: 'Analytics', page: 'AdminAnalytics' },
                { label: 'Reports', page: 'AdminReports' },
                { label: 'Audit Logs', page: 'AdminAuditLogs' },
              ].map(item => (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <Button variant="outline" className="w-full justify-start text-xs h-9">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bookings.slice(0, 6).map(booking => {
                  const svc = services.find(s => s.id === booking.service_id);
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-slate-800 truncate">{svc?.name || `#${booking.id.slice(0, 8)}`}</div>
                        <div className="text-xs text-slate-400">{booking.scheduled_date} · {booking.scheduled_time || '—'}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-slate-600">AED {booking.total_amount}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {bookings.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">No bookings yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboardContent />
      <OnboardingTooltip role="admin" />
    </AuthGuard>
  );
}
