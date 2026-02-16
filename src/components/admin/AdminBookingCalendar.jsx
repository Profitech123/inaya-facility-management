import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AdminBookingCalendar({ bookings, onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDay = (date) => {
    return bookings.filter(b => isSameDay(new Date(b.scheduled_date), date));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-slate-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 bg-slate-50 p-2 rounded-lg">
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "min-h-[120px] p-2 rounded border transition-all",
                  !isCurrentMonth && "bg-white text-slate-300 cursor-default",
                  isCurrentMonth && "bg-white hover:bg-slate-50 cursor-pointer",
                  isToday && "border-emerald-500 bg-emerald-50",
                  isSelected && "border-emerald-600 bg-emerald-100",
                  dayBookings.length > 0 && "border-slate-300"
                )}
                disabled={!isCurrentMonth}
              >
                <div className={cn(
                  "font-semibold text-sm mb-1",
                  isToday ? "text-emerald-700" : "text-slate-900"
                )}>
                  {format(day, 'd')}
                </div>
                
                {dayBookings.length > 0 && (
                  <div className="space-y-0.5 text-left">
                    <div className="text-xs font-medium text-slate-600">
                      {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <Badge 
                          key={booking.id} 
                          className={cn('text-[10px] py-0 px-1', getStatusColor(booking.status))}
                        >
                          {booking.status === 'completed' ? '✓' : 
                           booking.status === 'in_progress' ? '→' :
                           booking.status === 'cancelled' ? '✕' : '•'}
                        </Badge>
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-[10px] text-slate-500">
                          +{dayBookings.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
          <span>Cancelled</span>
        </div>
      </div>
    </Card>
  );
}