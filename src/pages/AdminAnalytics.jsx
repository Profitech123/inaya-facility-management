import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuthGuard from '../components/AuthGuard';
import DateRangeFilter from '../components/reports/DateRangeFilter';
import AnalyticsExportPanel from '../components/analytics/AnalyticsExportPanel';
import PremiumKPICards from '../components/analytics/PremiumKPICards';
import RevenueOverTimeChart from '../components/analytics/RevenueOverTimeChart';
import RevenueBreakdownCard from '../components/analytics/RevenueBreakdownCard';
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
import CustomerSatisfactionTrends from '../components/analytics/CustomerSatisfactionTrends';
import BookingForecastHeatmap from '../components/analytics/BookingForecastHeatmap';
import AIInsightsHub from '../components/analytics/AIInsightsHub';
import AIDemandPredictor from '../components/analytics/AIDemandPredictor';
import AIProviderInsights from '../components/analytics/AIProviderInsights';
import AIFinancialForecasting from '../components/analytics/AIFinancialForecasting';
import { Loader2, BarChart3, Brain, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    initialData: [], staleTime: 30000
  });
  const { data: subscriptions = [], isLoading: ls } = useQuery({
    queryKey: ['analyticsSubscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: [], staleTime: 30000
  });
  const { data: services = [] } = useQuery({
    queryKey: ['analyticsServices'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [], staleTime: 60000
  });
  const { data: providers = [] } = useQuery({
    queryKey: ['analyticsProviders'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: [], staleTime: 60000
  });
  const { data: packages = [] } = useQuery({
    queryKey: ['analyticsPackages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: [], staleTime: 60000
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ['analyticsReviews'],
    queryFn: () => base44.entities.ProviderReview.list(),
    initialData: [], staleTime: 60000
  });
  const { data: users = [] } = useQuery({
    queryKey: ['analyticsUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [], staleTime: 60000
  });

  const isLoading = lb || ls;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Premium Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMyAxLjM0NCAzIDMgMCAxLjY1Ni0xLjM0NCAzLTMgMy0xLjY1NiAwLTMtMS4zNDQtMy0zIDAtMS42NTYgMS4zNDQtMyAzLTN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics Command Center</h1>
              </div>
              <p className="text-slate-400 text-sm md:text-base">Real-time business intelligence, performance metrics, and AI-powered insights</p>
            </div>
            <AnalyticsExportPanel
              bookings={bookings} subscriptions={subscriptions} providers={providers}
              services={services} startDate={startDate} endDate={endDate}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-8">
          <DateRangeFilter
            startDate={startDate} endDate={endDate}
            onStartChange={setStartDate} onEndChange={setEndDate}
            onReset={() => { const d = getDefaultRange(); setStartDate(d.start); setEndDate(d.end); }}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
            </div>
            <p className="text-sm text-slate-500 mt-4 font-medium">Loading analytics data...</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white border border-slate-200 shadow-sm rounded-xl p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <BarChart3 className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <DollarSign className="w-3.5 h-3.5" /> Revenue
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Users className="w-3.5 h-3.5" /> Customers
              </TabsTrigger>
              <TabsTrigger value="operations" className="gap-2 rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <TrendingUp className="w-3.5 h-3.5" /> Operations
              </TabsTrigger>
              <TabsTrigger value="forecasts" className="gap-2 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                <Calendar className="w-3.5 h-3.5" /> Forecasts
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <Brain className="w-3.5 h-3.5" /> AI Insights
              </TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW ===== */}
            <TabsContent value="overview" className="space-y-6">
              <PremiumKPICards
                bookings={bookings} subscriptions={subscriptions} providers={providers}
                users={users} services={services} startDate={startDate} endDate={endDate}
              />

              <RevenueOverTimeChart bookings={bookings} subscriptions={subscriptions} startDate={startDate} endDate={endDate} />

              <div className="grid lg:grid-cols-2 gap-6">
                <PopularServicesChart bookings={bookings} services={services} startDate={startDate} endDate={endDate} />
                <CustomerAcquisitionChart bookings={bookings} subscriptions={subscriptions} startDate={startDate} endDate={endDate} />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <TechnicianPerformanceChart providers={providers} bookings={bookings} reviews={reviews} startDate={startDate} endDate={endDate} />
                <SubscriptionGrowthChart subscriptions={subscriptions} packages={packages} startDate={startDate} endDate={endDate} />
              </div>
            </TabsContent>

            {/* ===== REVENUE ===== */}
            <TabsContent value="revenue" className="space-y-6">
              <RevenueBreakdownCard bookings={bookings} subscriptions={subscriptions} services={services} packages={packages} startDate={startDate} endDate={endDate} />

              <RevenueOverTimeChart bookings={bookings} subscriptions={subscriptions} startDate={startDate} endDate={endDate} />

              <div className="grid lg:grid-cols-2 gap-6">
                <CustomerLifetimeValue bookings={bookings} subscriptions={subscriptions} />
                <ChurnRateChart subscriptions={subscriptions} startDate={startDate} endDate={endDate} />
              </div>
            </TabsContent>

            {/* ===== CUSTOMERS ===== */}
            <TabsContent value="customers" className="space-y-6">
              <CustomerSatisfactionTrends bookings={bookings} reviews={reviews} services={services} startDate={startDate} endDate={endDate} />

              <div className="grid lg:grid-cols-2 gap-6">
                <CustomerAcquisitionChart bookings={bookings} subscriptions={subscriptions} startDate={startDate} endDate={endDate} />
                <CohortRetentionChart bookings={bookings} />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <CustomerLifetimeValue bookings={bookings} subscriptions={subscriptions} />
                <ChurnRateChart subscriptions={subscriptions} startDate={startDate} endDate={endDate} />
              </div>
            </TabsContent>

            {/* ===== OPERATIONS ===== */}
            <TabsContent value="operations" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <TechnicianPerformanceChart providers={providers} bookings={bookings} reviews={reviews} startDate={startDate} endDate={endDate} />
                <TechnicianUtilization providers={providers} bookings={bookings} services={services} />
              </div>

              <ServiceCompletionTimeChart bookings={bookings} services={services} startDate={startDate} endDate={endDate} />

              <div className="grid lg:grid-cols-2 gap-6">
                <PopularServicesChart bookings={bookings} services={services} startDate={startDate} endDate={endDate} />
                <SubscriptionGrowthChart subscriptions={subscriptions} packages={packages} startDate={startDate} endDate={endDate} />
              </div>
            </TabsContent>

            {/* ===== FORECASTS ===== */}
            <TabsContent value="forecasts" className="space-y-6">
              <BookingForecastHeatmap bookings={bookings} startDate={startDate} endDate={endDate} />

              <div className="grid lg:grid-cols-2 gap-6">
                <DemandPrediction bookings={bookings} services={services} providers={providers} />
                <TechnicianUtilization providers={providers} bookings={bookings} services={services} />
              </div>

              <AIDemandPredictor bookings={bookings} services={services} providers={providers} subscriptions={subscriptions} />
            </TabsContent>

            {/* ===== AI INSIGHTS ===== */}
            <TabsContent value="ai" className="space-y-6">
              <AIInsightsHub
                bookings={bookings} subscriptions={subscriptions} services={services}
                providers={providers} packages={packages} reviews={reviews}
                startDate={startDate} endDate={endDate}
              />

              <div className="grid lg:grid-cols-2 gap-6">
                <AIDemandPredictor bookings={bookings} services={services} providers={providers} subscriptions={subscriptions} />
                <AIProviderInsights providers={providers} bookings={bookings} reviews={reviews} services={services} startDate={startDate} endDate={endDate} />
              </div>

              <AIFinancialForecasting bookings={bookings} subscriptions={subscriptions} services={services} packages={packages} startDate={startDate} endDate={endDate} />
            </TabsContent>
          </Tabs>
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