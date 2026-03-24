import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AuthGuard from '../components/AuthGuard';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SubscriptionHeroCard from '../components/dashboard/SubscriptionHeroCard';
import UpcomingServicesCard from '../components/dashboard/UpcomingServicesCard';
import RecentHistoryCard from '../components/dashboard/RecentHistoryCard';
import QuickActionsRow from '../components/dashboard/QuickActionsRow';
import SupportBanner from '../components/dashboard/SupportBanner';
import DashboardRecommendations from '../components/dashboard/DashboardRecommendations';
import PropertyHealthScore from '../components/dashboard/PropertyHealthScore';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import OnboardingTooltip from '../components/onboarding/OnboardingTooltip';

function DashboardContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ customer_id: user.id }, '-scheduled_date', 50),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.id],
    queryFn: async () => {
      try {
        const allSubs = await base44.entities.Subscription.list();
        return allSubs.filter(s => s.customer_id === user?.id && s.status === 'active');
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['subPackages'],
    queryFn: async () => {
      try {
        return await base44.entities.SubscriptionPackage.list();
      } catch (error) {
        console.error('Error fetching packages:', error);
        return [];
      }
    },
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: async () => {
      const all = await base44.entities.Property.list();
      return all.filter(p => p.owner_id === user?.id);
    },
    enabled: !!user?.id,
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        return await base44.entities.Service.list();
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeSub = subscriptions[0] || null;
  const activePackage = activeSub ? packages.find(p => p.id === activeSub.package_id) : null;
  const nextBooking = bookings.find(b => ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar currentPage="Dashboard" />

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        <div className="max-w-5xl mx-auto px-6 py-8 pt-20 lg:pt-8">
          <DashboardHeader user={user} hasActiveSub={!!activeSub} />

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

            {/* AI Property Health Score + Recommendations */}
            <div className="grid lg:grid-cols-2 gap-6">
              <PropertyHealthScore user={user} properties={properties} />
              <DashboardRecommendations user={user} bookings={bookings} />
            </div>

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