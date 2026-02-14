import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BookingCalendar from './BookingCalendar';

export default function BookingScheduleStep({ bookingData, setBookingData, properties, allBookings, onNext }) {
  const navigate = useNavigate();
  const isValid = bookingData.property_id && bookingData.scheduled_date && bookingData.scheduled_time;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Your Service</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Property *</label>
          {properties.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">No properties added yet.</p>
              <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl('MyProperties'))}>
                Add Property
              </Button>
            </div>
          ) : (
            <Select value={bookingData.property_id} onValueChange={(val) => setBookingData(prev => ({...prev, property_id: val}))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(prop => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.address} ({prop.property_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Calendar + Time Slots */}
        <BookingCalendar
          selectedDate={bookingData.scheduled_date}
          selectedTimeSlot={bookingData.scheduled_time}
          onDateChange={(date) => setBookingData(prev => ({...prev, scheduled_date: date, scheduled_time: ''}))}
          onTimeSlotChange={(timeSlot) => setBookingData(prev => ({...prev, scheduled_time: timeSlot}))}
          bookedSlots={allBookings}
        />

        <div className="flex justify-end pt-4">
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