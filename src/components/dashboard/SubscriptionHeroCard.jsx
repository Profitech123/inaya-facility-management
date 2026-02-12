import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Wrench, Zap, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubscriptionHeroCard({ subscription, packageData, nextBooking, services }) {
  const nextDate = nextBooking?.scheduled_date
    ? new Date(nextBooking.scheduled_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const statusLabel = nextBooking
    ? (nextBooking.status === 'confirmed' ? 'Awaiting technician arrival' : nextBooking.status?.replace('_', ' '))
    : 'No upcoming service';

  // Get included service names
  const includedServices = (packageData?.services || []).map(s => {
    const svc = services.find(sv => sv.id === s.service_id);
    return svc?.name || '';
  }).filter(Boolean).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row">
        {/* Left - Green card */}
        <div className="md:w-72 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 flex flex-col justify-end relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Wrench className="absolute top-8 right-8 w-32 h-32 text-white" />
          </div>
          <div className="relative">
            <div className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">Active Plan</div>
            <div className="text-white text-2xl font-bold">{packageData?.name || subscription?.package_id ? 'Subscription Plan' : 'No Active Plan'}</div>
          </div>
        </div>

        {/* Right - Details */}
        <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Next Scheduled Maintenance</div>
            <div className="flex items-center gap-2 text-slate-900 text-xl font-bold mb-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
              {nextDate || 'Not scheduled'}
            </div>
            {nextBooking && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-xs font-semibold text-emerald-700 uppercase">Status</span>
                <span className="text-xs text-slate-600 capitalize">{statusLabel}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            {includedServices.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="flex -space-x-1">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <Zap className="w-4 h-4 text-slate-400" />
                  <Droplets className="w-4 h-4 text-slate-400" />
                </div>
                <span>Includes {includedServices.join(', ')}</span>
              </div>
            )}
            <Link to={createPageUrl('MySubscriptions')}>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}