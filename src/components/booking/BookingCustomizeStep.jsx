import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AddonSelector from './AddonSelector';
import TechnicianSelector from './TechnicianSelector';

export default function BookingCustomizeStep({
  serviceId,
  bookingData,
  setBookingData,
  selectedAddonIds,
  setSelectedAddonIds,
  selectedProviderId,
  setSelectedProviderId,
  allBookings,
  onBack,
  onNext,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Your Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AddonSelector
          serviceId={serviceId}
          selectedIds={selectedAddonIds}
          onChange={setSelectedAddonIds}
        />

        <TechnicianSelector
          serviceId={serviceId}
          selectedProviderId={selectedProviderId}
          onChange={setSelectedProviderId}
          selectedDate={bookingData.scheduled_date}
          selectedTimeSlot={bookingData.scheduled_time}
          allBookings={allBookings}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
          <Textarea
            value={bookingData.customer_notes}
            onChange={(e) => setBookingData(prev => ({...prev, customer_notes: e.target.value}))}
            placeholder="Any special instructions, access codes, or requirements..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={onNext} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            Review & Confirm <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}