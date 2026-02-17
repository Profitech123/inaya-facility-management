import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import AddonSelector from './AddonSelector';
import TechnicianSelector from './TechnicianSelector';

export default function CustomizeStep({
  bookingData,
  setBookingData,
  serviceId,
  allBookings,
  onBack,
  onNext,
}) {
  return (
    <div className="space-y-6">
      {/* Add-ons */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Enhance Your Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddonSelector
            serviceId={serviceId}
            selectedIds={bookingData.addon_ids || []}
            onChange={(ids) => setBookingData(prev => ({ ...prev, addon_ids: ids }))}
          />
        </CardContent>
      </Card>

      {/* Technician */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Choose a Technician</CardTitle>
        </CardHeader>
        <CardContent>
          <TechnicianSelector
            serviceId={serviceId}
            selectedProviderId={bookingData.assigned_provider_id || ''}
            onChange={(id) => setBookingData(prev => ({ ...prev, assigned_provider_id: id }))}
            selectedDate={bookingData.scheduled_date}
            selectedTimeSlot={bookingData.scheduled_time}
            allBookings={allBookings}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Special Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bookingData.customer_notes || ''}
            onChange={(e) => setBookingData(prev => ({ ...prev, customer_notes: e.target.value }))}
            placeholder="Any special requests, access codes, or specific requirements..."
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          Review Booking <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}