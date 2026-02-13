import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { addMonths, format } from 'date-fns';

export default function SubscribePackage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [packageId, setPackageId] = useState(null);
  const [propertyId, setPropertyId] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    clientAuth.me().then(setUser).catch(() => { window.location.href = `/Login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`; });
    const params = new URLSearchParams(window.location.search);
    setPackageId(params.get('package'));
  }, []);

  const { data: pkg } = useQuery({
    queryKey: ['package', packageId],
    queryFn: async () => {
      const packages = await base44.entities.SubscriptionPackage.list();
      return packages.find(p => p.id === packageId);
    },
    enabled: !!packageId
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['myProperties', user?.id],
    queryFn: () => base44.entities.Property.filter({ owner_id: user.id }),
    enabled: !!user,
    initialData: []
  });

  const subscribeMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['mySubscriptions']);
      setSubscribed(true);
    }
  });

  const handleSubscribe = () => {
    if (!propertyId) {
      toast.error('Please select a property');
      return;
    }

    const startDate = new Date();
    const endDate = addMonths(startDate, pkg.duration_months);

    subscribeMutation.mutate({
      package_id: packageId,
      customer_id: user.id,
      property_id: propertyId,
      status: 'active',
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      next_billing_date: format(addMonths(startDate, 1), 'yyyy-MM-dd'),
      monthly_amount: pkg.monthly_price,
      auto_renew: true
    });
  };

  if (!user || !pkg) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (subscribed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Subscription Active!</h2>
            <p className="text-slate-600 mb-6">
              Your subscription has been activated successfully. Services will be scheduled automatically.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate(createPageUrl('MySubscriptions'))} className="w-full bg-emerald-600 hover:bg-emerald-700">
                View My Subscriptions
              </Button>
              <Button onClick={() => navigate(createPageUrl('Dashboard'))} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Subscribe to Package</h1>
          <p className="text-emerald-100">{pkg.name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Property</CardTitle>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">No properties added yet.</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(createPageUrl('MyProperties'))}
                    >
                      Add Property
                    </Button>
                  </div>
                ) : (
                  <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a property for this subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(prop => (
                        <SelectItem key={prop.id} value={prop.id}>
                          {prop.address} ({prop.property_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Package</div>
                  <div className="font-medium text-slate-900">{pkg.name}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-600 mb-1">Duration</div>
                  <div className="font-medium text-slate-900">{pkg.duration_months} months</div>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Includes</div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-bold mb-1">
                    <span>Monthly</span>
                    <span>AED {pkg.monthly_price}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Total: AED {pkg.monthly_price * pkg.duration_months} ({pkg.duration_months} months)
                  </div>
                </div>

                <Button 
                  onClick={handleSubscribe} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!propertyId || subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
