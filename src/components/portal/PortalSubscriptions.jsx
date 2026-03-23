import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, CalendarDays, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-500',
};

export default function PortalSubscriptions({ subscriptions, packages, services, properties }) {
  if (!subscriptions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
          <Package className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No active subscriptions</h3>
        <p className="text-slate-500 text-sm max-w-sm mb-6">
          Subscribe to a maintenance plan and get scheduled visits, priority support, and peace of mind.
        </p>
        <Link to={createPageUrl('Subscriptions')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            View Plans <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subscriptions.map(sub => {
        const pkg = packages.find(p => p.id === sub.package_id);
        const property = properties.find(p => p.id === sub.property_id);
        const daysLeft = sub.end_date ? differenceInDays(new Date(sub.end_date), new Date()) : null;

        const includedServices = (pkg?.services || []).map(s => {
          const svc = services.find(sv => sv.id === s.service_id);
          return svc ? { ...svc, frequency: s.frequency } : null;
        }).filter(Boolean);

        return (
          <Card key={sub.id} className="overflow-hidden border-slate-200">
            {/* Top bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-medium">Active Plan</div>
                <h3 className="text-white text-xl font-bold">{pkg?.name || 'Subscription Plan'}</h3>
              </div>
              <Badge className={`${statusColors[sub.status]} text-xs font-semibold px-3 py-1`}>
                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Key info */}
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Monthly Cost</div>
                    <div className="text-2xl font-bold text-slate-900">AED {sub.monthly_amount?.toLocaleString()}</div>
                  </div>
                  {sub.start_date && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Started</div>
                      <div className="text-sm font-semibold text-slate-700">{format(new Date(sub.start_date), 'dd MMM yyyy')}</div>
                    </div>
                  )}
                  {sub.end_date && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Renews / Ends</div>
                      <div className="text-sm font-semibold text-slate-700">{format(new Date(sub.end_date), 'dd MMM yyyy')}</div>
                      {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
                        <div className="text-xs text-amber-600 font-medium mt-0.5">{daysLeft} days remaining</div>
                      )}
                    </div>
                  )}
                  {sub.next_billing_date && (
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Next Billing</div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(sub.next_billing_date), 'dd MMM yyyy')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Property */}
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">Property</div>
                  {property ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 capitalize">{property.property_type}</span>
                      </div>
                      <div className="text-sm text-slate-600">{property.address}</div>
                      {property.area && <div className="text-xs text-slate-400 mt-1">{property.area}, {property.city}</div>}
                      {property.bedrooms && <div className="text-xs text-slate-400 mt-0.5">{property.bedrooms} bedrooms</div>}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400">No property linked</div>
                  )}
                </div>

                {/* Services included */}
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">Included Services</div>
                  {includedServices.length > 0 ? (
                    <ul className="space-y-2">
                      {includedServices.map(svc => (
                        <li key={svc.id} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-slate-700">{svc.name}</div>
                            {svc.frequency && (
                              <div className="text-xs text-slate-400 capitalize">{svc.frequency}</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : pkg?.features?.length ? (
                    <ul className="space-y-2">
                      {pkg.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-slate-400">See your plan for details</div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-5 border-t border-slate-100">
                <Link to={createPageUrl('MySubscriptions')}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Manage Plan
                  </Button>
                </Link>
                <Link to={createPageUrl('Support')}>
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="mt-2 text-center">
        <Link to={createPageUrl('Subscriptions')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          Browse all subscription plans →
        </Link>
      </div>
    </div>
  );
}