import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, DollarSign, CalendarDays, Users, Package,
  BarChart3, Plus, RefreshCw, ArrowUpRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthGuard from '../components/AuthGuard';
import AdminKPICard from '../components/admin/AdminKPICard';
import AdminRecentBookings from '../components/admin/AdminRecentBookings';
import AdminQuickActions from '../components/admin/AdminQuickActions';
import AdminNotifications from '../components/admin/AdminNotifications';
import DispatchMap from '../components/admin/DispatchMap';
import CreateJobDialog from '../components/admin/CreateJobDialog';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import OnboardingTooltip from '../components/onboarding/OnboardingTooltip';
import AIFeedbackSummarizer from '../components/admin/AIFeedbackSummarizer';

function greet(name) {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name?.split(' ')[0] || 'Admin'}`;
}

function AdminDashboardContent() {
  const [user, setUser] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 200),
    enabled: !!user,
    initialData: [],
    staleTime: 30000
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    enabled: !!user,
    initialData: [],
    staleTime: 60000
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    enabled: !!user,
    initialData: [],
    staleTime: 60000
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    enabled: !!user,
    initialData: [],
    staleTime: 60000
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['adminProperties'],
    queryFn: () => base44.entities.Property.list(),
    enabled: !!user,
    initialData: [],
    staleTime: 60000
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['adminReviews'],
    queryFn: () => base44.entities.ProviderReview.list('-created_date', 50),
    enabled: !!user,
    initialData: [],
    staleTime: 60000
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 50),
    enabled: !!user,
    initialData: [],
    staleTime: 60000
  });

  // KPI calculations
  const paid = bookings.filter(b => b.payment_status === 'paid');
  const totalRevenue = paid.reduce((s, b) => s + (b.total_amount || 0), 0);
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const monthlyRecurring = activeSubs.reduce((s, sub) => s + (sub.monthly_amount || 0), 0);
  const uniqueCustomers = new Set([...bookings.map(b => b.customer_id), ...subscriptions.map(s => s.customer_id)]).size;
  const completedJobs = bookings.filter(b => b.status === 'completed').length;
  const pendingJobs = bookings.filter(b => b.status === 'pending').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  // Last 6 months revenue chart
  const now = new Date();
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString('default', { month: 'short' });
    const revenue = paid
      .filter(b => {
        const bd = new Date(b.scheduled_date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      })
      .reduce((s, b) => s + (b.total_amount || 0), 0);
    const bookingCount = bookings.filter(b => {
      const bd = new Date(b.scheduled_date);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    }).length;
    return { month: label, revenue, bookings: bookingCount };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map(p => (
            <p key={p.dataKey} style={{ color: p.color }} className="text-xs">
              {p.dataKey === 'revenue' ? `AED ${p.value?.toLocaleString()}` : `${p.value} bookings`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{greet(user.full_name)}</h1>
            <p className="text-slate-500 mt-1 text-sm">Stay on top of your operations, monitor progress, and track status.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white border-slate-200 shadow-sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['allBookings'] });
                queryClient.invalidateQueries({ queryKey: ['providers'] });
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-sm" onClick={() => setShowCreateJob(true)}>
              <Plus className="w-4 h-4" /> Create Job
            </Button>
          </div>
        </div>

        {/* Onboarding */}
        <div className="mb-6">
          <OnboardingChecklist userRole="admin" />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <AdminKPICard
            label="Total Revenue" icon={DollarSign} accent="emerald"
            value={`AED ${(totalRevenue / 1000).toFixed(1)}k`}
            sub={`${paid.length} paid bookings`}
            trend="+12%" trendUp
          />
          <AdminKPICard
            label="Monthly Recurring" icon={TrendingUp} accent="blue"
            value={`AED ${(monthlyRecurring / 1000).toFixed(1)}k`}
            sub={`${activeSubs.length} active plans`}
            trend="+8%" trendUp
          />
          <AdminKPICard
            label="Total Bookings" icon={CalendarDays} accent="violet"
            value={bookings.length}
            sub={`${pendingJobs} pending`}
          />
          <AdminKPICard
            label="Customers" icon={Users} accent="amber"
            value={uniqueCustomers}
            sub={`${completedJobs} jobs done`}
            trend="+5%" trendUp
          />
          <AdminKPICard
            label="Avg Rating" icon={BarChart3} accent="teal"
            value={avgRating}
            sub={`${reviews.length} reviews`}
          />
          <AdminKPICard
            label="Active Services" icon={Package} accent="rose"
            value={services.filter(s => s.is_active).length}
            sub={`of ${services.length} total`}
          />
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Pending', val: pendingJobs, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { icon: CheckCircle2, label: 'Completed Today', val: bookings.filter(b => b.status === 'completed' && b.scheduled_date === new Date().toISOString().split('T')[0]).length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { icon: AlertCircle, label: 'Open Tickets', val: tickets.filter(t => t.status === 'open').length, color: 'text-rose-600 bg-rose-50 border-rose-100' },
          ].map(({ icon: Icon, label, val, color }) => (
            <div key={label} className={`flex items-center gap-3 p-4 rounded-2xl border ${color}`}>
              <Icon className="w-5 h-5" />
              <div>
                <div className="text-2xl font-bold leading-none">{val}</div>
                <div className="text-xs font-medium mt-0.5 opacity-80">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          {/* Revenue trend - takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-800">Revenue & Bookings</h3>
                <p className="text-xs text-slate-400">Last 6 months overview</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-emerald-500 inline-block" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-slate-300 inline-block" /> Bookings</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="bookings" fill="#e2e8f0" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue highlight card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-emerald-100">Total Earnings</span>
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-1">AED {(totalRevenue / 1000).toFixed(1)}k</div>
              <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +12% vs last period
              </div>
            </div>
            <div className="space-y-3 mt-6">
              {[
                { label: 'Subscription MRR', val: `AED ${monthlyRecurring.toLocaleString()}` },
                { label: 'Avg Booking Value', val: `AED ${paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0}` },
                { label: 'Active Customers', val: uniqueCustomers },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
                  <span className="text-xs text-emerald-100">{label}</span>
                  <span className="text-sm font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <AdminNotifications bookings={bookings} subscriptions={subscriptions} tickets={tickets} providers={providers} />
        </div>

        {/* Dispatch Map */}
        <div className="mb-6">
          <DispatchMap
            bookings={bookings} services={services} properties={properties} providers={providers}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ['allBookings'] });
              queryClient.invalidateQueries({ queryKey: ['providers'] });
            }}
          />
        </div>

        {/* Recent Bookings + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2">
            <AdminRecentBookings bookings={bookings} services={services} />
          </div>
          <AdminQuickActions />
        </div>

        {/* AI Feedback */}
        <div className="mb-6">
          <AIFeedbackSummarizer reviews={reviews} tickets={tickets} bookings={bookings} />
        </div>

      </div>
      <CreateJobDialog open={showCreateJob} onClose={() => setShowCreateJob(false)} />
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