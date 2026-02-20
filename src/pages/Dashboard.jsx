import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
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
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import OnboardingTooltip from '../components/onboarding/OnboardingTooltip';

function DashboardContent() {
  const [user, setUser] = useState(null);
  useEffect(() => { clientAuth.me().then(setUser).catch(() => {}); }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.id],
    queryFn: async () => { try { return (await base44.entities.Booking.list('-scheduled_date', 100)).filter(b => b.customer_id === user?.id).slice(0, 10); } catch { return []; } },
    enabled: !!user?.id, initialData: []
  });
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.id],
    queryFn: async () => { try { return (await base44.entities.Subscription.list()).filter(s => s.customer_id === user?.id && s.status === 'active'); } catch { return []; } },
    enabled: !!user?.id, initialData: []
  });
  const { data: packages = [] } = useQuery({
    queryKey: ['subPackages'],
    queryFn: async () => { try { return await base44.entities.SubscriptionPackage.list(); } catch { return []; } },
    initialData: []
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => { try { return await base44.entities.Service.list(); } catch { return []; } },
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(220,15%,96%)' }}>
        <div className="w-8 h-8 border-2 border-[hsl(160,60%,38%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeSub = subscriptions[0] || null;
  const activePackage = activeSub ? packages.find(p => p.id === activeSub.package_id) : null;
  const nextBooking = bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'hsl(220,15%,96%)' }}>
      <DashboardSidebar currentPage="Dashboard" />

      <div className="flex-1 lg:ml-56">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <DashboardHeader user={user} />

          <div className="space-y-6">
            <OnboardingChecklist userRole="customer" />

            <SubscriptionHeroCard
              subscription={activeSub}
              packageData={activePackage}
              nextBooking={nextBooking}
              services={services}
            />

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <UpcomingServicesCard bookings={bookings} services={services} />
              </div>
              <div className="lg:col-span-2">
                <RecentHistoryCard bookings={bookings} services={services} />
              </div>
            </div>

            <DashboardRecommendations user={user} bookings={bookings} />
            <QuickActionsRow />
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
