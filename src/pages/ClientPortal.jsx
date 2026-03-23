import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import PortalSubscriptions from '../components/portal/PortalSubscriptions';
import PortalSchedule from '../components/portal/PortalSchedule';
import PortalJobHistory from '../components/portal/PortalJobHistory';
import { LayoutDashboard, Package, CalendarDays, History } from 'lucide-react';

const TABS = [
  { key: 'subscriptions', label: 'Active Subscriptions', icon: Package },
  { key: 'schedule', label: 'Upcoming Schedule', icon: CalendarDays },
  { key: 'history', label: 'Job History', icon: History },
];

function ClientPortalContent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('subscriptions');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['portalBookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ customer_id: user?.id }, '-scheduled_date', 200),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['portalSubscriptions', user?.id],
    queryFn: () => base44.entities.Subscription.filter({ customer_id: user?.id }),
    enabled: !!user?.id,
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

  const { data: properties = [] } = useQuery({
    queryKey: ['portalProperties', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: user?.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: []
  });

  const { data: scheduledServices = [] } = useQuery({
    queryKey: ['portalScheduledServices', user?.id],
    queryFn: async () => {
      const subIds = subscriptions.map(s => s.id);
      if (!subIds.length) return [];
      const all = await base44.entities.ScheduledService.list('-scheduled_date', 200);
      return all.filter(ss => subIds.includes(ss.subscription_id));
    },
    enabled: subscriptions.length > 0,
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar currentPage="ClientPortal" />

      <div className="flex-1 lg:ml-56">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link to={createPageUrl('Dashboard')} className="hover:text-slate-600 flex items-center gap-1">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-medium">Client Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your subscriptions, upcoming visits, and full service history.</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="bg-white border-b border-slate-100 px-6">
          <div className="max-w-6xl mx-auto flex gap-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {activeTab === 'subscriptions' && (
            <PortalSubscriptions
              subscriptions={subscriptions}
              packages={packages}
              services={services}
              properties={properties}
            />
          )}
          {activeTab === 'schedule' && (
            <PortalSchedule
              bookings={bookings}
              scheduledServices={scheduledServices}
              services={services}
              properties={properties}
              providers={providers}
              subscriptions={subscriptions}
            />
          )}
          {activeTab === 'history' && (
            <PortalJobHistory
              bookings={bookings}
              services={services}
              properties={properties}
              providers={providers}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientPortal() {
  return (
    <AuthGuard requiredRole="customer">
      <ClientPortalContent />
    </AuthGuard>
  );
}