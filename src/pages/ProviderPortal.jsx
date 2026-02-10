import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProviderPortal() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const providers = await base44.entities.Provider.filter({ email: u.email });
      if (providers.length > 0) {
        setProvider(providers[0]);
      } else {
        alert('No provider account found. Contact admin.');
      }
    }).catch(() => window.location.href = createPageUrl('Home'));
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['providerBookings', provider?.id],
    queryFn: () => base44.entities.Booking.filter({ assigned_provider_id: provider.id }, '-scheduled_date'),
    enabled: !!provider,
    initialData: []
  });

  const todayJobs = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.scheduled_date === today && b.status !== 'completed' && b.status !== 'cancelled';
  });

  const upcomingJobs = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.scheduled_date > today && b.status !== 'cancelled';
  });

  if (!user || !provider) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome, {provider.full_name}</h1>
              <div className="flex items-center gap-4 text-emerald-100">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{provider.average_rating.toFixed(1)} rating</span>
                </div>
                <div>{provider.total_jobs_completed} jobs completed</div>
              </div>
            </div>
            <Link to={createPageUrl('ProviderJobs')}>
              <Button className="bg-white text-emerald-600 hover:bg-slate-100">
                View All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Jobs</CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{todayJobs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming Jobs</CardTitle>
              <Clock className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{upcomingJobs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{provider.total_jobs_completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todayJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No jobs scheduled for today
              </div>
            ) : (
              <div className="space-y-3">
                {todayJobs.map(booking => (
                  <Link key={booking.id} to={createPageUrl('ProviderJobDetails') + '?job=' + booking.id}>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{booking.scheduled_time}</div>
                          <div className="text-sm text-slate-500">Job #{booking.id.slice(0, 8)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}