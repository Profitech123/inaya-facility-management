import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/supabase/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AuthGuard } from '../components/AuthGuard';

function MyBookingsContent() {
  const { user, me } = useAuth();
  const currentUser = me();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['allMyBookings', currentUser?.id],
    queryFn: () => api.bookings.list({ customerId: currentUser?.id }),
    enabled: !!currentUser,
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.services.list(),
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', currentUser?.id],
    queryFn: () => api.properties.list(currentUser?.id),
    enabled: !!currentUser,
    initialData: []
  });

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';
  const getPropertyAddress = (id) => properties.find(p => p.id === id)?.address || '';

  const statusColor = (status) => ({
    completed: 'bg-green-100 text-green-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }[status] || 'bg-slate-100 text-slate-800');

  if (!currentUser || isLoading) {
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
          <p className="text-slate-300">View and track all your service bookings.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <Calendar className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No bookings yet</h3>
              <p className="text-slate-500 mb-2 max-w-sm leading-relaxed">
                You haven't booked any services yet. Browse our catalogue and schedule your first home maintenance visit in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link to={createPageUrl('OnDemandServices')}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Services</Button>
                </Link>
                <Link to={createPageUrl('Subscriptions')}>
                  <Button variant="outline">View Packages</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 text-lg">{getServiceName(booking.service_id)}</h3>
                        <Badge className={statusColor(booking.status)}>{booking.status?.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {booking.scheduled_date}
                        </span>
                        {booking.scheduled_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {booking.scheduled_time}
                          </span>
                        )}
                        {getPropertyAddress(booking.property_id) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {getPropertyAddress(booking.property_id)}
                          </span>
                        )}
                      </div>
                      {booking.customer_notes && (
                        <p className="text-sm text-slate-400 mt-2 italic">"{booking.customer_notes}"</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold text-slate-900">AED {booking.total_amount}</div>
                      <Badge variant="outline" className="mt-1">
                        {booking.payment_status === 'paid' ? '✓ Paid' : booking.payment_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
