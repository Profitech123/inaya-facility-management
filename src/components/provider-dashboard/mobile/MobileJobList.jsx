import React from 'react';
import { MapPin, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import moment from 'moment';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     bg: 'bg-slate-100',   text: 'text-slate-600',   bar: 'bg-slate-300' },
  confirmed:   { label: 'Confirmed',   bg: 'bg-blue-100',    text: 'text-blue-700',    bar: 'bg-blue-500' },
  en_route:    { label: 'En Route',    bg: 'bg-indigo-100',  text: 'text-indigo-700',  bar: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-100',   text: 'text-amber-700',   bar: 'bg-amber-500' },
  completed:   { label: 'Completed',   bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  delayed:     { label: 'Delayed',     bg: 'bg-red-100',     text: 'text-red-700',     bar: 'bg-red-500' },
  cancelled:   { label: 'Cancelled',   bg: 'bg-gray-100',    text: 'text-gray-500',    bar: 'bg-gray-300' },
};

export default function MobileJobList({ bookings, serviceMap, propertyMap, onSelect, emptyMessage, dim }) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  // Group by date
  const groups = {};
  bookings.forEach(b => {
    const key = moment(b.scheduled_date).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  return (
    <div className="px-4 py-3 space-y-5">
      {Object.entries(groups).map(([dateKey, jobs]) => {
        const isToday = moment(dateKey).isSame(moment(), 'day');
        const isTomorrow = moment(dateKey).isSame(moment().add(1, 'day'), 'day');
        const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : moment(dateKey).format('ddd, MMM D');

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase tracking-wide ${isToday ? 'text-emerald-600' : 'text-slate-500'}`}>
                {dateLabel}
              </span>
              <span className="text-xs text-slate-400">· {jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2.5">
              {jobs.map(b => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                const service = serviceMap[b.service_id];
                const property = propertyMap[b.property_id];

                return (
                  <button
                    key={b.id}
                    onClick={() => onSelect(b)}
                    className={`w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all active:scale-[0.98] ${dim ? 'opacity-70' : ''}`}
                  >
                    {/* Status bar */}
                    <div className={`h-1 w-full ${cfg.bar}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                            {b.status === 'delayed' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <p className="font-semibold text-slate-900 text-sm truncate">{service?.name || 'Service'}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-sm font-bold text-slate-900">AED {b.total_amount}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 mt-1" />
                        </div>
                      </div>
                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{b.scheduled_time || 'Time TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{property?.address || property?.area || 'Address pending'}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}