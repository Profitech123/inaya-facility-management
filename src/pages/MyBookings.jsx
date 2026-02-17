import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';
import BookingCard from '../components/bookings/BookingCard';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

function MyBookingsContent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['allMyBookings', user?.id],
    queryFn: () => base44.entities.Booking.filter({ customer_id: user?.id }, '-scheduled_date'),
    enabled: !!user,
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: user?.id }),
    enabled: !!user,
    initialData: []
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: []
  });

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';
  const getPropertyAddress = (id) => properties.find(p => p.id === id)?.address || '';
  const getProviderName = (id) => providers.find(p => p.id === id)?.full_name || '';

  const today = new Date().toISOString().split('T')[0];

  const filtered = bookings.filter(b => {
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    if (activeTab === 'past') return b.status === 'completed' || (b.scheduled_date < today && b.status !== 'cancelled');
    // upcoming: pending, confirmed, en_route, in_progress, delayed with future/today date
    return ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status) && b.scheduled_date >= today;
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center text-slate-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-slate-300">Manage, reschedule, or cancel your upcoming services.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 w-fit">
          {TABS.map(tab => {
            const count = bookings.filter(b => {
              if (tab.key === 'cancelled') return b.status === 'cancelled';
              if (tab.key === 'past') return b.status === 'completed' || (b.scheduled_date < today && b.status !== 'cancelled');
              return ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status) && b.scheduled_date >= today;
            }).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                {activeTab === 'upcoming' ? (
                  <Calendar className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                ) : (
                  <ClipboardList className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {activeTab === 'upcoming' ? 'No upcoming bookings' : activeTab === 'past' ? 'No past bookings' : 'No cancelled bookings'}
              </h3>
              <p className="text-slate-500 mb-4 max-w-sm leading-relaxed">
                {activeTab === 'upcoming'
                  ? 'Schedule your next home maintenance visit in minutes.'
                  : 'Your booking history will appear here.'}
              </p>
              {activeTab === 'upcoming' && (
                <div className="flex gap-3">
                  <Link to={createPageUrl('OnDemandServices')}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Services</Button>
                  </Link>
                  <Link to={createPageUrl('Subscriptions')}>
                    <Button variant="outline">View Packages</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                serviceName={getServiceName(booking.service_id)}
                propertyAddress={getPropertyAddress(booking.property_id)}
                providerName={getProviderName(booking.assigned_provider_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  return (
    <AuthGuard requiredRole="customer">
      <MyBookingsContent />
    </AuthGuard>
  );
}