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

function DashboardContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ customer_id: user?.id }, '-scheduled_date', 10),
    enabled: !!user,
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.id],
    queryFn: () => base44.entities.Subscription.filter({ customer_id: user?.id, status: 'active' }),
    enabled: !!user,
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['subPackages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
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
  const nextBooking = bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar currentPage="Dashboard" />

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <DashboardHeader user={user} />

          <div className="space-y-6">
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
    </AuthGuard>
  );
}