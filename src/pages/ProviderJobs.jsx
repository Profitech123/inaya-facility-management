import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProviderJobs() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const providers = await base44.entities.Provider.filter({ email: u.email });
      if (providers.length > 0) setProvider(providers[0]);
    }).catch(() => window.location.href = createPageUrl('Home'));
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['providerBookings', provider?.id],
    queryFn: () => base44.entities.Booking.filter({ assigned_provider_id: provider.id }, '-scheduled_date'),
    enabled: !!provider,
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

  const pending = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const inProgress = bookings.filter(b => b.status === 'in_progress');
  const completed = bookings.filter(b => b.status === 'completed');

  const getService = (id) => services.find(s => s.id === id);
  const getProperty = (id) => properties.find(p => p.id === id);

  const JobCard = ({ booking }) => {
    const service = getService(booking.service_id);
    const property = getProperty(booking.property_id);
    
    return (
      <Link to={createPageUrl('ProviderJobDetails') + '?job=' + booking.id}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">{service?.name || 'Service'}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {booking.scheduled_date} at {booking.scheduled_time}
                  </div>
                </div>
              </div>
              <Badge className={
                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'
              }>
                {booking.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {property && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div>{property.address}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (!provider) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">My Jobs</h1>
          <p className="text-slate-300">View and manage your assigned service jobs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {pending.map(booking => <JobCard key={booking.id} booking={booking} />)}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {inProgress.map(booking => <JobCard key={booking.id} booking={booking} />)}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {completed.map(booking => <JobCard key={booking.id} booking={booking} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}