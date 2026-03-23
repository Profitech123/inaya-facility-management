import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, User, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  en_route: { label: 'En Route', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'In Progress', color: 'bg-violet-100 text-violet-700' },
  delayed: { label: 'Delayed', color: 'bg-orange-100 text-orange-700' },
  scheduled: { label: 'Scheduled', color: 'bg-slate-100 text-slate-600' },
};

function getDateLabel(dateStr) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isThisWeek(d)) return format(d, 'EEEE');
  return format(d, 'dd MMM yyyy');
}

function groupByDate(items) {
  const groups = {};
  items.forEach(item => {
    const key = item.scheduled_date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function PortalSchedule({ bookings, scheduledServices, services, properties, providers, subscriptions }) {
  const today = new Date().toISOString().split('T')[0];

  // upcoming one-off bookings
  const upcomingBookings = bookings
    .filter(b => ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(b.status) && b.scheduled_date >= today)
    .map(b => ({ ...b, _type: 'booking' }));

  // upcoming scheduled services
  const upcomingScheduled = scheduledServices
    .filter(ss => ['scheduled', 'confirmed'].includes(ss.status) && ss.scheduled_date >= today)
    .map(ss => ({ ...ss, _type: 'scheduled' }));

  const all = [...upcomingBookings, ...upcomingScheduled];

  if (!all.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
          <CalendarDays className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No upcoming visits</h3>
        <p className="text-slate-500 text-sm max-w-sm mb-6">Book a service or subscribe to a maintenance plan to see your schedule here.</p>
        <Link to={createPageUrl('OnDemandServices')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            Browse Services <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const grouped = groupByDate(all);

  return (
    <div className="space-y-8">
      {grouped.map(([date, items]) => (
        <div key={date}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 text-white rounded-xl px-3.5 py-2 text-center min-w-[52px]">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{format(parseISO(date), 'MMM')}</div>
              <div className="text-xl font-bold leading-none">{format(parseISO(date), 'd')}</div>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base">{getDateLabel(date)}</div>
              <div className="text-xs text-slate-400">{items.length} visit{items.length > 1 ? 's' : ''}</div>
            </div>
          </div>

          <div className="space-y-3 ml-1">
            {items.map(item => {
              const service = services.find(s => s.id === item.service_id);
              const property = properties.find(p => p.id === item.property_id);
              const provider = item.assigned_provider_id
                ? providers.find(p => p.id === item.assigned_provider_id)
                : item.assigned_provider
                  ? providers.find(p => p.id === item.assigned_provider)
                  : null;
              const cfg = statusConfig[item.status] || statusConfig.pending;

              return (
                <Card key={item.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${cfg.color} text-xs font-semibold`}>{cfg.label}</Badge>
                          {item._type === 'scheduled' && (
                            <Badge className="bg-emerald-50 text-emerald-600 text-xs">Subscription Visit</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 text-[15px]">
                          {service?.name || 'Service Visit'}
                        </h4>

                        <div className="mt-2 space-y-1.5">
                          {item.scheduled_time && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              {item.scheduled_time}
                            </div>
                          )}
                          {property && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">{property.address}{property.area ? `, ${property.area}` : ''}</span>
                            </div>
                          )}
                          {provider && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <User className="w-3.5 h-3.5" />
                              {provider.full_name}
                            </div>
                          )}
                        </div>
                      </div>

                      {item._type === 'booking' && (
                        <Link to={createPageUrl('BookingDetail') + '?id=' + item.id} className="flex-shrink-0">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-700">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}