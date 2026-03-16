import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import WeekView from './WeekView';
import MonthView from './MonthView';
import BookingEventDetailModal from './BookingEventDetailModal';
import { toast } from 'sonner';

export default function BookingCalendarDashboard() {
  const [view, setView] = useState('week'); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all needed data
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-cal-bookings'],
    queryFn: () => base44.entities.Booking.list('-scheduled_date', 500),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list(),
  });

  const serviceMap = Object.fromEntries(services.map(s => [s.id, s]));
  const providerMap = Object.fromEntries(providers.map(p => [p.id, p]));

  // Filter bookings to current view range
  const rangeStart = view === 'week' ? startOfWeek(currentDate, { weekStartsOn: 0 }) : startOfMonth(currentDate);
  const rangeEnd = view === 'week' ? endOfWeek(currentDate, { weekStartsOn: 0 }) : endOfMonth(currentDate);

  const visibleBookings = bookings.filter(b => {
    if (!b.scheduled_date) return false;
    const d = new Date(b.scheduled_date);
    return d >= rangeStart && d <= rangeEnd;
  });

  const handlePrev = () => {
    setCurrentDate(prev => view === 'week' ? subWeeks(prev, 1) : subMonths(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate(prev => view === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDrop = async (bookingId, newDate) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const oldDate = booking.scheduled_date;
    // Optimistic update
    queryClient.setQueryData(['admin-cal-bookings'], prev =>
      prev.map(b => b.id === bookingId ? { ...b, scheduled_date: newDate } : b)
    );
    try {
      await base44.entities.Booking.update(bookingId, {
        scheduled_date: newDate,
        rescheduled_from_date: oldDate,
        reschedule_count: (booking.reschedule_count || 0) + 1,
      });
      toast.success('Booking rescheduled');
      queryClient.invalidateQueries({ queryKey: ['admin-cal-bookings'] });
    } catch {
      queryClient.setQueryData(['admin-cal-bookings'], prev =>
        prev.map(b => b.id === bookingId ? { ...b, scheduled_date: oldDate } : b)
      );
      toast.error('Failed to reschedule booking');
    }
  };

  const titleLabel = view === 'week'
    ? `${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Drag & drop to reschedule bookings</p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'month' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Calendar className="w-4 h-4" /> Month
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={handleToday} className="px-3">Today</Button>
            <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
          </div>

          <span className="text-sm font-semibold text-slate-700 min-w-[180px] text-center">{titleLabel}</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'week' ? (
          <WeekView
            startDate={rangeStart}
            bookings={visibleBookings}
            serviceMap={serviceMap}
            providerMap={providerMap}
            onDrop={handleDrop}
            onBookingClick={setSelectedBooking}
          />
        ) : (
          <MonthView
            currentDate={currentDate}
            bookings={visibleBookings}
            serviceMap={serviceMap}
            providerMap={providerMap}
            onDrop={handleDrop}
            onBookingClick={setSelectedBooking}
          />
        )}
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <BookingEventDetailModal
          booking={selectedBooking}
          service={serviceMap[selectedBooking.service_id]}
          provider={providerMap[selectedBooking.assigned_provider_id]}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}