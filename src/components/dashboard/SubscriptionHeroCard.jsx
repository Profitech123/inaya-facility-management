import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-700',
  en_route: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-purple-100 text-purple-700',
  pending: 'bg-amber-100 text-amber-700',
  delayed: 'bg-orange-100 text-orange-700',
};

export default function SubscriptionHeroCard({ subscription, packageData, nextBooking, services }) {
  const nextDate = nextBooking?.scheduled_date
    ? new Date(nextBooking.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null;

  const statusLabel = nextBooking?.status?.replace(/_/g, ' ') || null;
  const statusClass = nextBooking ? (statusColors[nextBooking.status] || 'bg-slate-100 text-slate-600') : '';

  const includedServices = (packageData?.services || [])
    .map(s => services.find(sv => sv.id === s.service_id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  if (!subscription) {
    // No active plan — CTA card
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
        {/* decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">No Active Plan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Protect Your Home
            </h2>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Subscribe to a maintenance plan and get priority service, dedicated technicians, and savings up to 30%.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <Link to={createPageUrl('Subscriptions')}>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 rounded-xl shadow-lg shadow-emerald-900/30 gap-2">
                Browse Packages <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={createPageUrl('OnDemandServices')}>
              <Button variant="ghost" className="text-slate-400 hover:text-white text-sm gap-1">
                Book one-off service <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 sm:p-8 shadow-lg shadow-emerald-200">
      {/* decorative circles */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-16 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Active Plan
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
            {packageData?.name || 'Subscription Plan'}
          </h2>

          {includedServices.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {includedServices.map(name => (
                <span key={name} className="inline-flex items-center gap-1 text-xs text-emerald-50 bg-white/15 rounded-full px-2.5 py-1">
                  <CheckCircle className="w-3 h-3" /> {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
          {nextBooking ? (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-right min-w-[180px]">
              <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-wider mb-1">Next Visit</p>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
                <Calendar className="w-4 h-4" />
                {nextDate}
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          ) : (
            <div className="bg-white/15 rounded-xl p-4 text-white text-sm text-right">
              <p className="text-emerald-100 text-[11px] font-bold uppercase tracking-wider mb-1">Next Visit</p>
              <p className="font-semibold">Not yet scheduled</p>
            </div>
          )}
          <Link to={createPageUrl('MySubscriptions')}>
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl px-5 gap-2 shadow-md">
              Manage Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}