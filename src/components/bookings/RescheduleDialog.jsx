import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Info, Clock } from 'lucide-react';
import { getRescheduleDetails, CANCELLATION_POLICY } from './CancellationPolicyHelper';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
];

export default function RescheduleDialog({ open, onOpenChange, booking, onConfirm, isLoading }) {
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState('');
  const rescheduleInfo = getRescheduleDetails(booking);

  const handleConfirm = () => {
    onConfirm({
      newDate: format(newDate, 'yyyy-MM-dd'),
      newTime,
    });
  };

  const tomorrow = addDays(new Date(), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Choose a new date and time for your service.
          </DialogDescription>
        </DialogHeader>

        {!rescheduleInfo.allowed ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {rescheduleInfo.reason}
          </div>
        ) : (
          <>
            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">{rescheduleInfo.reason}</p>
                <p className="text-blue-500 mt-1">
                  Current: {booking.scheduled_date} {booking.scheduled_time && `at ${booking.scheduled_time}`}
                </p>
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">New Date</label>
              <div className="border rounded-xl p-1 flex justify-center">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  disabled={(date) => isBefore(date, startOfDay(tomorrow))}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Time slot */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                New Time Slot
              </label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Policy note */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500">
              <p>• Max {CANCELLATION_POLICY.maxReschedules} reschedules per booking</p>
              <p>• Must reschedule {CANCELLATION_POLICY.minRescheduleHours}+ hours before service</p>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          {rescheduleInfo.allowed && (
            <Button
              onClick={handleConfirm}
              disabled={!newDate || !newTime || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}