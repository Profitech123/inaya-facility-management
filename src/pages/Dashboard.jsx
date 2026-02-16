import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/supabase/api';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../components/AuthGuard';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SubscriptionHeroCard from '../components/dashboard/SubscriptionHeroCard';
import UpcomingServicesCard from '../components/dashboard/UpcomingServicesCard';
import RecentHistoryCard from '../components/dashboard/RecentHistoryCard';
import QuickActionsRow from '../components/dashboard/QuickActionsRow';
import SupportBanner from '../components/dashboard/SupportBanner';
import DashboardRecommendations from '../components/dashboard/DashboardRecommendations';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import OnboardingTooltip from '../components/onboarding/OnboardingTooltip';

function DashboardContent() {
  const { user, me } = useAuth();
  const currentUser = me();

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', currentUser?.id],
    queryFn: async () => {
      try {
        return await api.bookings.list({ customerId: currentUser?.id });
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
    },
    enabled: !!currentUser?.id,
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', currentUser?.id],
    queryFn: async () => {
      try {
        return await api.subscriptions.list({ customerId: currentUser?.id, status: 'active' });
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
      }
    },
    enabled: !!currentUser?.id,
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['subPackages'],
    queryFn: async () => {
      try {
        return await api.packages.list({ active: true });
      } catch (error) {
        console.error('Error fetching packages:', error);
        return [];
      }
    },
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        return await api.services.list({ active: true });
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    initialData: []
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeSub = subscriptions[0] || null;
  const activePackage = activeSub ? packages.find(p => p.id === activeSub.package_id) : null;
  const nextBooking = bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar currentPage="Dashboard" />

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <DashboardHeader user={currentUser} />

          <div className="space-y-6">
            {/* Onboarding Checklist */}
            <OnboardingChecklist userRole="customer" />

            {/* Hero subscription card */}
            <SubscriptionHeroCard
              subscription={activeSub}
              packageData={activePackage}
              nextBooking={nextBooking}
              services={services}
            />

            {/* Two-column: upcoming + history */}
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <UpcomingServicesCard bookings={bookings} services={services} />
              </div>
              <div className="lg:col-span-2">
                <RecentHistoryCard bookings={bookings} services={services} />
              </div>
            </div>

            {/* AI Recommendations */}
            <DashboardRecommendations user={currentUser} bookings={bookings} />

            {/* Quick actions */}
            <QuickActionsRow />

            {/* Support banner */}
            <SupportBanner />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard requiredRole="customer">
      <DashboardContent />
      <OnboardingTooltip role="customer" />
    </AuthGuard>
  );
}
