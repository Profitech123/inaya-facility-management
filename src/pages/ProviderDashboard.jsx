import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import moment from 'moment';
import AuthGuard from '../components/AuthGuard';

import ProviderDashboardHeader from '../components/provider-dashboard/ProviderDashboardHeader';
import ProviderJobCard from '../components/provider-dashboard/ProviderJobCard';
import ProviderJobDetail from '../components/provider-dashboard/ProviderJobDetail';
import ProviderJobMap from '../components/provider-dashboard/ProviderJobMap';
import ProviderEarnings from '../components/provider-dashboard/ProviderEarnings';
import ProviderAvailability from '../components/provider-dashboard/ProviderAvailability';

function ProviderDashboardContent() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [jobFilter, setJobFilter] = useState('upcoming');
  const [activeTab, setActiveTab] = useState('jobs');

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['providerUser'],
    queryFn: () => base44.auth.me(),
  });

  // Find provider record linked to this user
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ['myProvider', user?.email],
    queryFn: async () => {
      const providers = await base44.entities.Provider.filter({ email: user.email });
      return providers?.[0] || null;
    },
    enabled: !!user?.email,
  });

  const queryClient = useQueryClient();

  // Get bookings assigned to this provider
  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ['providerBookings', provider?.id],
    queryFn: async () => {
      const all = await base44.entities.Booking.list('-scheduled_date', 200);
      return all.filter(b => b.assigned_provider_id === provider.id);
    },
    enabled: !!provider?.id,
    initialData: [],
  });

  // Real-time booking updates
  useEffect(() => {
    if (!provider?.id) return;
    const unsubscribe = base44.entities.Booking.subscribe((event) => {
      if (event.data?.assigned_provider_id === provider.id || 
          bookings.some(b => b.id === event.id)) {
        queryClient.invalidateQueries({ queryKey: ['providerBookings'] });
      }
    });
    return unsubscribe;
  }, [provider?.id, queryClient]);

  // Load services, properties, users for display
  const { data: services = [] } = useQuery({
    queryKey: ['providerServices'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['providerProperties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['providerCustomers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  // Filter bookings
  const filteredBookings = useMemo(() => {
    const today = moment().startOf('day');
    let filtered = [...bookings];

    switch (jobFilter) {
      case 'today':
        filtered = filtered.filter(b => moment(b.scheduled_date).isSame(today, 'day'));
        break;
      case 'upcoming':
        filtered = filtered.filter(b =>
          !['completed', 'cancelled'].includes(b.status) &&
          moment(b.scheduled_date).isSameOrAfter(today, 'day')
        );
        break;
      case 'completed':
        filtered = filtered.filter(b => b.status === 'completed');
        break;
      case 'all':
      default:
        break;
    }

    return filtered.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  }, [bookings, jobFilter]);

  const todayCount = bookings.filter(b => moment(b.scheduled_date).isSame(moment(), 'day') && !['completed', 'cancelled'].includes(b.status)).length;
  const activeCount = bookings.filter(b => ['confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status)).length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Provider Profile Not Found</h2>
          <p className="text-slate-500 text-sm">
            Your email ({user?.email}) is not linked to a provider profile yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const handleJobUpdate = () => {
    refetchBookings();
    setSelectedBooking(null);
  };

  const getService = (id) => services.find(s => s.id === id);
  const getProperty = (id) => properties.find(p => p.id === id);
  const getCustomer = (id) => customers.find(u => u.id === id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Provider Header Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA" className="h-7"
          />
          <span className="text-sm font-medium text-slate-400">Provider Portal</span>
        </div>
        <button
          onClick={() => base44.auth.logout()}
          className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ProviderDashboardHeader provider={provider} todayCount={todayCount} activeCount={activeCount} completedCount={completedCount} />

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedBooking(null); }}>
          <TabsList className="bg-white border border-slate-200 p-1 h-auto flex-wrap">
            <TabsTrigger value="jobs" className="text-sm px-5">My Jobs</TabsTrigger>
            <TabsTrigger value="map" className="text-sm px-5">Map View</TabsTrigger>
            <TabsTrigger value="earnings" className="text-sm px-5">Earnings</TabsTrigger>
            <TabsTrigger value="availability" className="text-sm px-5">Availability</TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-5">
            {selectedBooking ? (
              <ProviderJobDetail
                booking={selectedBooking}
                service={getService(selectedBooking.service_id)}
                property={getProperty(selectedBooking.property_id)}
                customer={getCustomer(selectedBooking.customer_id)}
                onBack={() => setSelectedBooking(null)}
                onUpdate={handleJobUpdate}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Assigned Jobs</h2>
                  <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="all">All Jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-lg font-medium">No jobs found</p>
                    <p className="text-sm mt-1">
                      {jobFilter === 'today' ? "You don't have any jobs scheduled for today." :
                       jobFilter === 'upcoming' ? "No upcoming jobs at the moment." :
                       jobFilter === 'completed' ? "No completed jobs yet." : "No jobs found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map(b => (
                      <ProviderJobCard
                        key={b.id}
                        booking={b}
                        service={getService(b.service_id)}
                        property={getProperty(b.property_id)}
                        customer={getCustomer(b.customer_id)}
                        onSelect={setSelectedBooking}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-5">
            <ProviderJobMap
              bookings={bookings}
              services={services}
              properties={properties}
              onSelectBooking={(b) => { setSelectedBooking(b); setActiveTab('jobs'); }}
            />
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-5">
            <ProviderEarnings bookings={bookings} services={services} />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="mt-5">
            <ProviderAvailability provider={provider} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ProviderDashboard() {
  return (
    <AuthGuard requiredRole="any">
      <ProviderDashboardContent />
    </AuthGuard>
  );
}