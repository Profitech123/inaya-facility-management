import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIME_SLOTS = [
  { id: '08:00-10:00', label: '8:00 AM – 10:00 AM' },
  { id: '10:00-12:00', label: '10:00 AM – 12:00 PM' },
  { id: '12:00-14:00', label: '12:00 PM – 2:00 PM' },
  { id: '14:00-16:00', label: '2:00 PM – 4:00 PM' },
  { id: '16:00-18:00', label: '4:00 PM – 6:00 PM' },
];

export default function BookingCalendar({ selectedDate, selectedTimeSlot, onDateChange, onTimeSlotChange, bookedSlots = [] }) {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);

  const isSlotBooked = (date, slotId) => {
    if (!date) return false;
    return bookedSlots.some(b =>
      isSameDay(new Date(b.scheduled_date), date) && b.scheduled_time === slotId
    );
  };

  const getBookedCount = (date) => {
    return bookedSlots.filter(b => isSameDay(new Date(b.scheduled_date), date)).length;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Pick a Date</label>
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onDateChange(date);
              onTimeSlotChange('');
            }}
            disabled={(date) => date < today || date > maxDate}
            modifiers={{
              busy: (date) => getBookedCount(date) >= 3,
            }}
            modifiersClassNames={{
              busy: "!text-amber-600 !font-bold",
            }}
            className="rounded-lg"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">Book up to 90 days in advance</p>
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          <Clock className="w-4 h-4 inline mr-1.5" />
          {selectedDate ? `Available Slots — ${format(selectedDate, 'EEE, MMM d')}` : 'Select a date first'}
        </label>
        {!selectedDate ? (
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
            Select a date to view time slots
          </div>
        ) : (
          <div className="space-y-2">
            {TIME_SLOTS.map((slot) => {
              const booked = isSlotBooked(selectedDate, slot.id);
              const selected = selectedTimeSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => !booked && onTimeSlotChange(slot.id)}
                  disabled={booked}
                  className={cn(
                    "w-full p-4 rounded-xl text-left text-sm font-medium transition-all border-2",
                    booked
                      ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                      : selected
                      ? "bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{slot.label}</span>
                    {booked && <span className="text-xs text-slate-400">Unavailable</span>}
                    {selected && <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Selected</span>}
                  </div>
                </button>
              );
            })}
            <p className="text-xs text-slate-400 mt-2">
              {TIME_SLOTS.filter(s => !isSlotBooked(selectedDate, s.id)).length} of {TIME_SLOTS.length} slots available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}