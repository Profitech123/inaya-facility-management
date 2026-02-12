import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';

import ProviderProfileHeader from '../components/admin/provider-detail/ProviderProfileHeader';
import ProviderKPICards from '../components/admin/provider-detail/ProviderKPICards';
import ProviderCurrentAssignment from '../components/admin/provider-detail/ProviderCurrentAssignment';
import ProviderSkillsCerts from '../components/admin/provider-detail/ProviderSkillsCerts';
import ProviderTodaySchedule from '../components/admin/provider-detail/ProviderTodaySchedule';
import ProviderRecentHistory from '../components/admin/provider-detail/ProviderRecentHistory';
import ProviderContactInfo from '../components/admin/provider-detail/ProviderContactInfo';

function AdminProviderDetailContent() {
  const [providerId, setProviderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProviderId(params.get('id'));
  }, []);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const providers = await base44.entities.Provider.list();
      return providers.find(p => p.id === providerId);
    },
    enabled: !!providerId,
    staleTime: 30000
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['providerBookings', providerId],
    queryFn: () => base44.entities.Booking.filter({ assigned_provider_id: providerId }, '-scheduled_date'),
    enabled: !!providerId,
    initialData: [],
    staleTime: 30000
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
    staleTime: 60000
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['providerReviews', providerId],
    queryFn: () => base44.entities.ProviderReview.filter({ provider_id: providerId }),
    enabled: !!providerId,
    initialData: [],
    staleTime: 60000
  });

  if (isLoading || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.scheduled_date === today && b.status !== 'cancelled');
  const activeBooking = bookings.find(b => b.status === 'in_progress');
  const activeService = activeBooking ? services.find(s => s.id === activeBooking.service_id) : null;
  const activeProperty = activeBooking ? properties.find(p => p.id === activeBooking.property_id) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Back button */}
        <Link to={createPageUrl('AdminDashboard')}>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-700 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        {/* Profile Header */}
        <ProviderProfileHeader provider={provider} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <ProviderKPICards provider={provider} bookings={bookings} reviews={reviews} />

            {/* Current Assignment */}
            <ProviderCurrentAssignment booking={activeBooking} service={activeService} property={activeProperty} />

            {/* Recent History */}
            <ProviderRecentHistory bookings={bookings} services={services} properties={properties} reviews={reviews} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Skills */}
            <ProviderSkillsCerts provider={provider} />

            {/* Today's Schedule */}
            <ProviderTodaySchedule todayBookings={todayBookings} services={services} />

            {/* Contact Info */}
            <ProviderContactInfo provider={provider} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProviderDetail() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminProviderDetailContent />
    </AuthGuard>
  );
}