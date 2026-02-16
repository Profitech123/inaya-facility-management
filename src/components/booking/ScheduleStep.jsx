import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import BookingCalendar from './BookingCalendar';

export default function ScheduleStep({ bookingData, setBookingData, allBookings, onBack, onNext }) {
  const isValid = bookingData.scheduled_date && bookingData.scheduled_time;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-emerald-600" />
          Choose Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BookingCalendar
          selectedDate={bookingData.scheduled_date}
          selectedTimeSlot={bookingData.scheduled_time}
          onDateChange={(date) => setBookingData(prev => ({ ...prev, scheduled_date: date, scheduled_time: '' }))}
          onTimeSlotChange={(timeSlot) => setBookingData(prev => ({ ...prev, scheduled_time: timeSlot }))}
          bookedSlots={allBookings}
        />

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}