import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthGuard from '../components/AuthGuard';

function MyBookingsContent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    clientAuth.me().then(setUser).catch(() => {});
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

  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';
  const getPropertyAddress = (id) => properties.find(p => p.id === id)?.address || '';

  const statusColor = (status) => ({
    completed: 'bg-green-100 text-green-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }[status] || 'bg-slate-100 text-slate-800');

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
          <p className="text-slate-300">View and track all your service bookings.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No bookings yet</h3>
              <p className="text-slate-500 mb-6">Book your first service to get started.</p>
              <Link to={createPageUrl('Services')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Services</Button>
              </Link>
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
