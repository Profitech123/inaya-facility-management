import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AuthGuard } from '../components/AuthGuard';
import DateRangeFilter from '../components/reports/DateRangeFilter';
import EnhancedKPICards from '../components/analytics/EnhancedKPICards';
import RevenueOverTimeChart from '../components/analytics/RevenueOverTimeChart';
import PopularServicesChart from '../components/analytics/PopularServicesChart';
import CustomerAcquisitionChart from '../components/analytics/CustomerAcquisitionChart';
import TechnicianPerformanceChart from '../components/analytics/TechnicianPerformanceChart';
import SubscriptionGrowthChart from '../components/analytics/SubscriptionGrowthChart';
import CustomerLifetimeValue from '../components/analytics/CustomerLifetimeValue';
import CohortRetentionChart from '../components/analytics/CohortRetentionChart';
import DemandPrediction from '../components/analytics/DemandPrediction';
import TechnicianUtilization from '../components/analytics/TechnicianUtilization';
import ChurnRateChart from '../components/analytics/ChurnRateChart';
import ServiceCompletionTimeChart from '../components/analytics/ServiceCompletionTimeChart';
import AnalyticsExportPanel from '../components/analytics/AnalyticsExportPanel';
import { Loader2 } from 'lucide-react';

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function AdminAnalyticsContent() {
  const defaults = getDefaultRange();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);

  const { data: bookings = [], isLoading: lb } = useQuery({
    queryKey: ['analyticsBookings'],
    queryFn: () => base44.entities.Booking.list(),
    initialData: [],
    staleTime: 30000
  });
  const { data: subscriptions = [], isLoading: ls } = useQuery({
    queryKey: ['analyticsSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [],
    staleTime: 30000
  });
  const { data: services = [] } = useQuery({
    queryKey: ['analyticsServices'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: providers = [] } = useQuery({
    queryKey: ['analyticsProviders'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: packages = [] } = useQuery({
    queryKey: ['analyticsPackages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['analyticsReviews'],
    queryFn: () => base44.entities.ProviderReview.list(),
    initialData: [],
    staleTime: 60000
  });
  const { data: users = [] } = useQuery({
    queryKey: ['analyticsUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    staleTime: 60000
  });

  const isLoading = lb || ls;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-500 text-sm">Comprehensive business metrics, KPIs, and performance insights</p>
          </div>
          <AnalyticsExportPanel
            bookings={bookings}
            subscriptions={subscriptions}
            providers={providers}
            services={services}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onReset={() => { const d = getDefaultRange(); setStartDate(d.start); setEndDate(d.end); }}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced KPIs with CLV, Churn, Completion Time, Utilization */}
            <EnhancedKPICards
              bookings={bookings}
              subscriptions={subscriptions}
              providers={providers}
              users={users}
              services={services}
              startDate={startDate}
              endDate={endDate}
            />

            {/* Revenue Over Time - full width */}
            <RevenueOverTimeChart
              bookings={bookings}
              subscriptions={subscriptions}
              startDate={startDate}
              endDate={endDate}
            />

            {/* Churn Analysis + Service Completion Time - two cols */}
            <div className="grid lg:grid-cols-2 gap-6">
              <ChurnRateChart
                subscriptions={subscriptions}
                startDate={startDate}
                endDate={endDate}
              />
              <ServiceCompletionTimeChart
                bookings={bookings}
                services={services}
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            {/* Popular Services + Customer Acquisition - two cols */}
            <div className="grid lg:grid-cols-2 gap-6">
              <PopularServicesChart
                bookings={bookings}
                services={services}
                startDate={startDate}
                endDate={endDate}
              />
              <CustomerAcquisitionChart
                bookings={bookings}
                subscriptions={subscriptions}
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            {/* Technician Performance + Subscription Growth - two cols */}
            <div className="grid lg:grid-cols-2 gap-6">
              <TechnicianPerformanceChart
                providers={providers}
                bookings={bookings}
                reviews={reviews}
                startDate={startDate}
                endDate={endDate}
              />
              <SubscriptionGrowthChart
                subscriptions={subscriptions}
                packages={packages}
                startDate={startDate}
                endDate={endDate}
              />
            </div>

            {/* CLV + Cohort Retention */}
            <div className="grid lg:grid-cols-2 gap-6">
              <CustomerLifetimeValue
                bookings={bookings}
                subscriptions={subscriptions}
              />
              <CohortRetentionChart
                bookings={bookings}
              />
            </div>

            {/* Demand Prediction + Technician Utilization */}
            <div className="grid lg:grid-cols-2 gap-6">
              <DemandPrediction
                bookings={bookings}
                services={services}
                providers={providers}
              />
              <TechnicianUtilization
                providers={providers}
                bookings={bookings}
                services={services}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminAnalyticsContent />
    </AuthGuard>
  );
}
