import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format, addDays, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_SLOTS = [
  { id: '08:00-10:00', label: '08:00 - 10:00', start: '08:00', end: '10:00' },
  { id: '10:00-12:00', label: '10:00 - 12:00', start: '10:00', end: '12:00' },
  { id: '12:00-14:00', label: '12:00 - 14:00', start: '12:00', end: '14:00' },
  { id: '14:00-16:00', label: '14:00 - 16:00', start: '14:00', end: '16:00' },
  { id: '16:00-18:00', label: '16:00 - 18:00', start: '16:00', end: '18:00' },
];

export default function TimeSlotSelector({ selectedDate, selectedTimeSlot, onDateChange, onTimeSlotChange, bookedSlots = [] }) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isSlotBooked = (date, slotId) => {
    return bookedSlots.some(booking => 
      isSameDay(new Date(booking.scheduled_date), date) && 
      booking.scheduled_time === slotId
    );
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    return TIME_SLOTS.filter(slot => !isSlotBooked(selectedDate, slot.id));
  };

  const availableSlots = getAvailableSlots();
  const slotsFull = availableSlots.length === 0 && selectedDate;

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Select Date</label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateChange(date);
                setCalendarOpen(false);
              }}
              disabled={(date) => {
                const today = startOfDay(new Date());
                const maxDate = addDays(today, 90);
                return date < today || date > maxDate;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-slate-500 mt-2">Available up to 90 days in advance</p>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <Clock className="w-4 h-4 inline mr-1.5" />
            Select Time Slot - {format(selectedDate, 'EEEE, MMMM d')}
          </label>
          
          {slotsFull ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              All time slots are fully booked for this date. Please select another date.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isBooked = isSlotBooked(selectedDate, slot.id);
                const isSelected = selectedTimeSlot === slot.id;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isBooked && onTimeSlotChange(slot.id)}
                    disabled={isBooked}
                    className={cn(
                      "p-3 rounded-lg font-medium text-sm transition-all",
                      isBooked
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-emerald-600 text-white border-2 border-emerald-600"
                        : "bg-white text-slate-900 border-2 border-slate-200 hover:border-emerald-400"
                    )}
                  >
                    {slot.label}
                    {isBooked && <span className="text-xs block mt-1">Booked</span>}
                  </button>
                );
              })}
            </div>
          )}
          
          <p className="text-xs text-slate-500 mt-3">
            {availableSlots.length} of {TIME_SLOTS.length} slots available
          </p>
        </div>
      )}
    </div>
  );
}