import React from 'react';
import { Calendar, Wrench, Droplets, Zap, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const serviceIcons = {
  'ac': Zap,
  'clean': Droplets,
  'tank': Droplets,
  'plumb': Wrench,
  'electric': Zap,
};

function getIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, Icon] of Object.entries(serviceIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return Wrench;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  en_route: { label: 'En Route', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  delayed: { label: 'Delayed', className: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export default function UpcomingServicesCard({ bookings, services, isLoading }) {
  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';

  const upcoming = bookings
    .filter(b => ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Upcoming Services</span>
        </div>
        <Link to={createPageUrl('MyBookings')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} className="h-[72px] rounded-xl" />)
        ) : upcoming.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No upcoming services</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Schedule a maintenance visit to keep your home in perfect shape.</p>
            <Link to={createPageUrl('OnDemandServices')}>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                Book a Service <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        ) : upcoming.map(booking => {
          const name = getServiceName(booking.service_id);
          const Icon = getIcon(name);
          const status = statusConfig[booking.status] || statusConfig.pending;
          const date = booking.scheduled_date
            ? new Date(booking.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '';

          return (
            <Link key={booking.id} to={createPageUrl('BookingDetail') + '?id=' + booking.id}>
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-emerald-200 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm truncate">{name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {date}{booking.scheduled_time ? ` · ${booking.scheduled_time}` : ''}
                  </div>
                </div>
                <Badge className={`text-[10px] font-semibold border flex-shrink-0 ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}