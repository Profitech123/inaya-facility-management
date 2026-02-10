import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, DollarSign } from 'lucide-react';

export default function AdminSubscriptions() {
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
    initialData: []
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.SubscriptionPackage.list(),
    initialData: []
  });

  const getPackage = (packageId) => packages.find(p => p.id === packageId);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Manage Subscriptions</h1>
          <p className="text-slate-300">View and manage all active subscriptions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">Active Subscriptions</div>
              <div className="text-3xl font-bold text-slate-900">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">Monthly Recurring Revenue</div>
              <div className="text-3xl font-bold text-slate-900">
                AED {subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.monthly_amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-600 mb-2">Total Subscriptions</div>
              <div className="text-3xl font-bold text-slate-900">{subscriptions.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {subscriptions.map(subscription => {
            const pkg = getPackage(subscription.package_id);
            
            return (
              <Card key={subscription.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-slate-600" />
                          {pkg?.name || 'Package'}
                        </div>
                      </CardTitle>
                      <div className="text-sm text-slate-600">
                        Subscription #{subscription.id.slice(0, 8)}
                      </div>
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
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        Monthly Amount
                      </div>
                      <div className="text-lg font-bold">AED {subscription.monthly_amount}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        Start Date
                      </div>
                      <div className="text-lg font-medium">{subscription.start_date}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        End Date
                      </div>
                      <div className="text-lg font-medium">{subscription.end_date}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        Next Billing
                      </div>
                      <div className="text-lg font-medium">{subscription.next_billing_date}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}