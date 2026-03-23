import React from 'react';
import { Clock, MapPin, CheckCircle2, Circle, Play, Truck, AlertTriangle, ChevronRight, CalendarDays } from 'lucide-react';
import moment from 'moment';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     dot: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-600',   Icon: Circle },
  confirmed:   { label: 'Confirmed',   dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700',     Icon: Circle },
  en_route:    { label: 'En Route',    dot: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-700', Icon: Truck },
  in_progress: { label: 'In Progress', dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700',   Icon: Play },
  completed:   { label: 'Completed',   dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  delayed:     { label: 'Delayed',     dot: 'bg-red-500',     badge: 'bg-red-100 text-red-700',       Icon: AlertTriangle },
  cancelled:   { label: 'Cancelled',   dot: 'bg-gray-300',    badge: 'bg-gray-100 text-gray-500',     Icon: Circle },
};

export default function TodaySchedule({ bookings, services, properties, onSelectBooking }) {
  const today = moment().startOf('day');

  const todayJobs = bookings
    .filter(b => moment(b.scheduled_date).isSame(today, 'day') && b.status !== 'cancelled')
    .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

  const upcomingJobs = bookings
    .filter(b =>
      moment(b.scheduled_date).isAfter(today, 'day') &&
      !['completed', 'cancelled'].includes(b.status)
    )
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, 5);

  const completedToday = todayJobs.filter(b => b.status === 'completed').length;
  const remainingToday = todayJobs.filter(b => b.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Day summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{todayJobs.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Today's Jobs</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{completedToday}</p>
          <p className="text-xs text-slate-500 mt-0.5">Completed</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{remainingToday}</p>
          <p className="text-xs text-slate-500 mt-0.5">Remaining</p>
        </div>
      </div>

      {/* Today's timeline */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Today — {moment().format('dddd, MMMM D')}
          </h2>
        </div>

        {todayJobs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-3xl mb-2">☀️</p>
            <p className="font-semibold text-slate-700">No jobs scheduled today</p>
            <p className="text-xs text-slate-400 mt-1">Check your upcoming jobs below</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-200 z-0" />
            <div className="space-y-3">
              {todayJobs.map((booking, idx) => {
                const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.Icon;
                const service = services.find(s => s.id === booking.service_id);
                const property = properties.find(p => p.id === booking.property_id);
                const isCompleted = booking.status === 'completed';

                return (
                  <button
                    key={booking.id}
                    onClick={() => onSelectBooking(booking)}
                    className={`relative w-full text-left flex gap-4 bg-white rounded-2xl border shadow-sm p-4 transition-all active:scale-[0.98] hover:shadow-md ${
                      isCompleted ? 'border-emerald-100 opacity-70' : 'border-slate-100'
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-50' : 'bg-slate-50'} border-2 ${isCompleted ? 'border-emerald-200' : 'border-slate-200'}`}>
                        <StatusIcon className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {service?.name || 'Service'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-sm font-bold text-slate-700">AED {booking.total_amount}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {booking.scheduled_time && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span>{booking.scheduled_time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{property?.address || property?.area || 'Address pending'}</span>
                        </div>
                      </div>

                      {/* Access notes preview */}
                      {property?.access_notes && !isCompleted && (
                        <div className="mt-2 bg-amber-50 rounded-lg px-2.5 py-1.5">
                          <p className="text-[10px] font-bold text-amber-600 uppercase">Access</p>
                          <p className="text-xs text-amber-700 truncate">{property.access_notes}</p>
                        </div>
                      )}
                      {/* Customer notes preview */}
                      {booking.customer_notes && !isCompleted && (
                        <div className="mt-2 bg-blue-50 rounded-lg px-2.5 py-1.5">
                          <p className="text-[10px] font-bold text-blue-600 uppercase">Customer Note</p>
                          <p className="text-xs text-blue-700 truncate">{booking.customer_notes}</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming jobs */}
      {upcomingJobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Coming Up</h2>
          </div>
          <div className="space-y-2">
            {upcomingJobs.map(booking => {
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const service = services.find(s => s.id === booking.service_id);
              const property = properties.find(p => p.id === booking.property_id);
              const isTomorrow = moment(booking.scheduled_date).isSame(moment().add(1, 'day'), 'day');
              const dateLabel = isTomorrow ? 'Tomorrow' : moment(booking.scheduled_date).format('ddd, MMM D');

              return (
                <button
                  key={booking.id}
                  onClick={() => onSelectBooking(booking)}
                  className="w-full text-left flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{service?.name || 'Service'}</p>
                    <p className="text-xs text-slate-500">{dateLabel} · {booking.scheduled_time || 'TBD'} · {property?.area || ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}