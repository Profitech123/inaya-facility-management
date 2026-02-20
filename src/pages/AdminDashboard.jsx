import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Package, DollarSign, Users, TrendingUp, Repeat, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import StableAdminWrapper from '@/components/StableAdminWrapper';
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
      .then(u => { if (mounted) { setUser(u); setIsLoadingUser(false); } })
      .catch(() => { if (mounted) setIsLoadingUser(false); });
    return () => { mounted = false; };
  }, []);

  const queryOpts = { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, refetchOnWindowFocus: false, refetchOnMount: false };

  const { data: bookings = [] } = useQuery({ queryKey: ['allBookings'], queryFn: () => base44.entities.Booking.list('-created_date', 200), enabled: !isLoadingUser, ...queryOpts });
  const { data: subscriptions = [] } = useQuery({ queryKey: ['allSubscriptions'], queryFn: () => base44.entities.Subscription.list(), enabled: !isLoadingUser, ...queryOpts });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.Service.list(), enabled: !isLoadingUser, ...queryOpts });
  const { data: providers = [] } = useQuery({ queryKey: ['providers'], queryFn: () => base44.entities.Provider.list(), enabled: !isLoadingUser, ...queryOpts });
  const { data: reviews = [] } = useQuery({ queryKey: ['adminReviews'], queryFn: () => base44.entities.ProviderReview.list('-created_date', 50), enabled: !isLoadingUser, ...queryOpts });
  const { data: tickets = [] } = useQuery({ queryKey: ['adminTickets'], queryFn: () => base44.entities.SupportTicket.list('-created_date', 50), enabled: !isLoadingUser, ...queryOpts });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment_status === 'paid' ? b.total_amount : 0), 0);
  const monthlyRecurring = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthly_amount, 0);
  const uniqueCustomers = new Set([...bookings.map(b => b.customer_id), ...subscriptions.map(s => s.customer_id)]).size;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;
  const avgBookingValue = bookings.filter(b => b.payment_status === 'paid').length > 0
    ? Math.round(totalRevenue / bookings.filter(b => b.payment_status === 'paid').length) : 0;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(220,15%,96%)' }}>
        <div className="w-8 h-8 border-2 border-[hsl(160,60%,38%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString()}`, sub: 'From paid bookings', icon: DollarSign, trend: '+12.5%', up: true, color: 'hsl(160,60%,38%)' },
    { label: 'Monthly Recurring', value: `AED ${monthlyRecurring.toLocaleString()}`, sub: `${subscriptions.filter(s => s.status === 'active').length} active`, icon: Repeat, trend: '+8.2%', up: true, color: 'hsl(210,80%,55%)' },
    { label: 'Total Bookings', value: bookings.length, sub: `${bookings.filter(b => b.status === 'pending').length} pending`, icon: Calendar, trend: '+23%', up: true, color: 'hsl(270,60%,55%)' },
    { label: 'Customers', value: uniqueCustomers, sub: `${completedJobs} jobs done`, icon: Users, trend: '+5.1%', up: true, color: 'hsl(40,80%,55%)' },
    { label: 'Active Services', value: services.length, sub: `${services.filter(s => s.is_active).length} live`, icon: TrendingUp, trend: '+2', up: true, color: 'hsl(350,70%,55%)' },
    { label: 'Avg Booking', value: `AED ${avgBookingValue}`, sub: 'Per transaction', icon: Package, trend: '-3.2%', up: false, color: 'hsl(180,50%,45%)' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6" style={{ backgroundColor: 'hsl(220,15%,96%)' }}>
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] tracking-tight">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</h2>
        <p className="text-sm text-[hsl(210,10%,55%)]">Here is what is happening across your business today.</p>
      </div>

      <OnboardingChecklist userRole="admin" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-[hsl(220,15%,92%)] hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? 'text-[hsl(160,60%,38%)]' : 'text-red-500'}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </div>
              </div>
              <div className="text-xl font-bold text-[hsl(210,20%,10%)] tracking-tight">{kpi.value}</div>
              <div className="text-[11px] text-[hsl(210,10%,55%)] mt-0.5">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Notifications */}
      <AdminNotifications bookings={bookings} subscriptions={subscriptions} tickets={tickets} providers={providers} />

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
          <DashboardBookingTrends bookings={bookings} />
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
          <DashboardRevenueByService bookings={bookings} services={services} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
          <DashboardMiniSubscriptions subscriptions={subscriptions} />
        </div>
        <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
          <DashboardTechPerformance providers={providers} bookings={bookings} reviews={reviews} />
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
        <AIFeedbackSummarizer reviews={reviews} tickets={tickets} bookings={bookings} />
      </div>

      {/* Quick Actions + Recent Bookings */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
          <h3 className="text-sm font-semibold text-[hsl(210,20%,10%)] mb-4 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
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
                <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[hsl(220,15%,92%)] text-xs font-medium text-[hsl(210,20%,30%)] hover:bg-[hsl(220,15%,96%)] hover:border-[hsl(160,60%,38%)]/30 transition-all group">
                  {item.label}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[hsl(160,60%,38%)] transition-opacity" />
                </button>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[hsl(220,15%,92%)] p-6">
          <h3 className="text-sm font-semibold text-[hsl(210,20%,10%)] mb-4 uppercase tracking-wider">Recent Bookings</h3>
          <div className="space-y-2">
            {bookings.slice(0, 6).map(booking => {
              const svc = services.find(s => s.id === booking.service_id);
              return (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl border border-[hsl(220,15%,94%)] hover:border-[hsl(160,60%,38%)]/20 transition-colors">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-[hsl(210,20%,10%)] truncate">{svc?.name || `#${booking.id.slice(0, 8)}`}</div>
                    <div className="text-xs text-[hsl(210,10%,55%)]">{booking.scheduled_date} {booking.scheduled_time ? `at ${booking.scheduled_time}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-[hsl(210,20%,10%)]">AED {booking.total_amount}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                      booking.status === 'completed' ? 'bg-[hsl(160,60%,38%)]/10 text-[hsl(160,60%,38%)]' :
                      booking.status === 'confirmed' ? 'bg-[hsl(210,80%,55%)]/10 text-[hsl(210,80%,55%)]' :
                      booking.status === 'in_progress' ? 'bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]' :
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-[hsl(40,80%,55%)]/10 text-[hsl(40,80%,50%)]'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && (
              <p className="text-sm text-[hsl(210,10%,55%)] text-center py-8">No bookings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <StableAdminWrapper>
      <AdminDashboardContent />
      <OnboardingTooltip role="admin" />
    </StableAdminWrapper>
  );
}
