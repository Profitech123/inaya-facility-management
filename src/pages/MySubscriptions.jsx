import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Package } from 'lucide-react';

export default function MySubscriptions() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => window.location.href = '/');
  }, []);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['mySubscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_id: user?.id }, '-created_date'),
    enabled: !!user,
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: []
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: []
  });

  const getPackage = (packageId) => packages.find(p => p.id === packageId);
  const getProperty = (propertyId) => properties.find(p => p.id === propertyId);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-slate-300">Manage your active subscription packages.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg mb-4">No active subscriptions</p>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Browse Packages
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subscriptions.map(subscription => {
              const pkg = getPackage(subscription.package_id);
              const property = getProperty(subscription.property_id);
              
              return (
                <Card key={subscription.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{pkg?.name || 'Package'}</CardTitle>
                        <p className="text-slate-600">{property?.address || 'Property'}</p>
                      </div>
                      <Badge className={
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }>
                        {subscription.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Monthly Amount</div>
                        <div className="flex items-center gap-1 text-2xl font-bold text-slate-900">
                          <DollarSign className="w-5 h-5" />
                          AED {subscription.monthly_amount}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Start Date</div>
                        <div className="flex items-center gap-1 text-lg font-medium text-slate-900">
                          <Calendar className="w-4 h-4" />
                          {subscription.start_date}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Next Billing</div>
                        <div className="flex items-center gap-1 text-lg font-medium text-slate-900">
                          <Calendar className="w-4 h-4" />
                          {subscription.next_billing_date}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">View Schedule</Button>
                      <Button variant="outline" size="sm">Update Payment</Button>
                      {subscription.status === 'active' && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}