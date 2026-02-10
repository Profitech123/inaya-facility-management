import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Package, Home, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = createPageUrl('Home'));
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ customer_id: user?.id }, '-created_date', 5),
    enabled: !!user,
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_id: user?.id, status: 'active' }),
    enabled: !!user,
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.email],
    queryFn: () => base44.entities.Property.filter({ owner_id: user?.id }),
    enabled: !!user,
    initialData: []
  });

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.full_name || 'there'}!</h1>
          <p className="text-slate-300">Manage your bookings, subscriptions, and properties.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Bookings</CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Subscriptions</CardTitle>
              <Package className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{subscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Properties</CardTitle>
              <Home className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{properties.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link to={createPageUrl('MyBookings')}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">No bookings yet</p>
                  <Link to={createPageUrl('Services')}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Book a Service
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">Booking #{booking.id.slice(0, 8)}</div>
                          <div className="text-sm text-slate-500">{booking.scheduled_date}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl('Services')}>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a New Service
                </Button>
              </Link>
              <Link to={createPageUrl('Subscriptions')}>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Browse Subscription Packages
                </Button>
              </Link>
              <Link to={createPageUrl('MyProperties')}>
                <Button variant="outline" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-2" />
                  Manage Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}