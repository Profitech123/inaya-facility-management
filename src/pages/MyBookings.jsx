import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Star } from 'lucide-react';
import ProviderRating from '../components/ProviderRating';
import BookingTimeline from '../components/booking/BookingTimeline';
import AuthGuard from '../components/AuthGuard';

function MyBookingsContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = '/');
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
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
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: []
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
    initialData: []
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['myReviews', user?.id],
    queryFn: () => base44.entities.ProviderReview.filter({ customer_id: user?.id }),
    enabled: !!user,
    initialData: []
  });

  const getService = (serviceId) => services.find(s => s.id === serviceId);
  const getProperty = (propertyId) => properties.find(p => p.id === propertyId);
  const getProvider = (providerId) => providers.find(p => p.id === providerId);
  const hasReviewed = (bookingId) => reviews.some(r => r.booking_id === bookingId);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-slate-300">View and manage all your service bookings.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-slate-600 text-lg">No bookings yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const service = getService(booking.service_id);
              const property = getProperty(booking.property_id);
              const provider = booking.assigned_provider_id ? getProvider(booking.assigned_provider_id) : null;
              const reviewed = hasReviewed(booking.id);
              
              return (
                <div key={booking.id} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{service?.name || 'Service'}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {booking.scheduled_date} at {booking.scheduled_time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {property?.address || 'Property'}
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <BookingTimeline booking={booking} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {provider && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                              <span>Provider: {provider.full_name}</span>
                              {provider.average_rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{provider.average_rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {booking.customer_notes && (
                            <p className="text-sm text-slate-600 mt-1">Notes: {booking.customer_notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-lg font-bold text-slate-900">
                            <DollarSign className="w-5 h-5" />
                            AED {booking.total_amount}
                          </div>
                          <div className="text-sm text-slate-500">{booking.payment_status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {booking.status === 'completed' && provider && !reviewed && (
                    <ProviderRating booking={booking} provider={provider} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}