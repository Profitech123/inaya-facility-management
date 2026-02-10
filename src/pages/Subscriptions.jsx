import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Subscriptions() {
  const { data: packages = [] } = useQuery({
    queryKey: ['subscriptionPackages'],
    queryFn: () => base44.entities.SubscriptionPackage.filter({ is_active: true }),
    initialData: []
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Subscription Packages</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Comprehensive home care packages with recurring services. Save time and money with our tailored subscription plans.
          </p>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {packages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg mb-4">Subscription packages coming soon!</p>
              <p className="text-slate-500 mb-8">We're preparing exclusive packages for homeowners.</p>
              <Link to={createPageUrl('Services')}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Individual Services
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {packages.map(pkg => (
                <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-2 border-emerald-500 shadow-xl' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-emerald-500 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                    <p className="text-slate-600 text-sm">{pkg.description}</p>
                    <div className="mt-6">
                      <div className="text-4xl font-bold text-slate-900">AED {pkg.monthly_price}</div>
                      <div className="text-slate-500">/month</div>
                      <div className="text-sm text-slate-500 mt-1">{pkg.duration_months} month contract</div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {pkg.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to={createPageUrl('SubscribePackage') + '?package=' + pkg.id}>
                      <Button className={`w-full ${pkg.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                        Subscribe Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}