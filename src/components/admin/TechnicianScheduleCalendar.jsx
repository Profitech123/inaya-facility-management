import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_SLOTS = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'
];

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function TechnicianScheduleCalendar({ providers, bookings, services, onBookingClick }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedProviderId, setSelectedProviderId] = useState('all');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredProviders = selectedProviderId === 'all'
    ? providers
    : providers.filter(p => p.id === selectedProviderId);

  const getBookingsForCell = (providerId, day, slot) => {
    return bookings.filter(b =>
      b.assigned_provider_id === providerId &&
      b.scheduled_date && isSameDay(new Date(b.scheduled_date), day) &&
      b.scheduled_time === slot &&
      b.status !== 'cancelled'
    );
  };

  const getProviderDayStats = (providerId, day) => {
    const dayBookings = bookings.filter(b =>
      b.assigned_provider_id === providerId &&
      b.scheduled_date && isSameDay(new Date(b.scheduled_date), day) &&
      b.status !== 'cancelled'
    );
    return {
      total: dayBookings.length,
      utilization: Math.round((dayBookings.length / TIME_SLOTS.length) * 100)
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Technician Schedule</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Weekly view · {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProviders.map(provider => (
          <div key={provider.id} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {provider.profile_image ? (
                  <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-900">{provider.full_name}</span>
                <span className="text-xs text-slate-400 ml-2">
                  {provider.specialization?.join(', ') || 'General'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-slate-500 w-24 border-b">Time Slot</th>
                    {weekDays.map(day => {
                      const stats = getProviderDayStats(provider.id, day);
                      const isToday = isSameDay(day, new Date());
                      return (
                        <th key={day.toString()} className={cn(
                          "p-2 text-center border-b min-w-[120px]",
                          isToday && "bg-emerald-50"
                        )}>
                          <div className={cn("font-semibold", isToday ? "text-emerald-700" : "text-slate-700")}>
                            {format(day, 'EEE')}
                          </div>
                          <div className="text-slate-400 font-normal">{format(day, 'MMM d')}</div>
                          {stats.total > 0 && (
                            <Badge variant="outline" className="text-[9px] mt-1 px-1 py-0">
                              {stats.utilization}% booked
                            </Badge>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(slot => (
                    <tr key={slot}>
                      <td className="p-2 font-medium text-slate-500 border-b whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot}
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const cellBookings = getBookingsForCell(provider.id, day, slot);
                        const isToday = isSameDay(day, new Date());
                        return (
                          <td key={day.toString()} className={cn(
                            "p-1 border-b border-l",
                            isToday && "bg-emerald-50/50",
                            cellBookings.length === 0 && "bg-slate-50/50"
                          )}>
                            {cellBookings.length > 0 ? (
                              <div className="space-y-1">
                                {cellBookings.map(b => {
                                  const svc = services.find(s => s.id === b.service_id);
                                  return (
                                    <button
                                      key={b.id}
                                      onClick={() => onBookingClick?.(b)}
                                      className={cn(
                                        "w-full text-left p-1.5 rounded border text-[10px] leading-tight hover:opacity-80 transition-opacity",
                                        STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-700'
                                      )}
                                    >
                                      <div className="font-semibold truncate">{svc?.name || 'Service'}</div>
                                      <div className="opacity-70">#{b.id.slice(0, 6)}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-10 flex items-center justify-center text-slate-300">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredProviders.length === 0 && (
          <div className="text-center py-12 text-slate-400">No technicians to display</div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded border", color)} />
              <span className="text-xs text-slate-500 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}