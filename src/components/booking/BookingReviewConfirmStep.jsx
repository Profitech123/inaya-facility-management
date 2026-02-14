import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BookingReviewStep from './BookingReviewStep';

export default function BookingReviewConfirmStep({
  service,
  selectedProperty,
  bookingData,
  selectedAddons,
  selectedProvider,
  grandTotal,
  addonsTotal,
  isProcessingPayment,
  onBack,
  onConfirm,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Review Your Booking</h2>
      <BookingReviewStep
        service={service}
        property={selectedProperty}
        bookingData={bookingData}
        selectedAddons={selectedAddons}
        provider={selectedProvider}
        grandTotal={grandTotal}
        addonsTotal={addonsTotal}
      />

      <div className="flex items-center justify-between pt-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isProcessingPayment}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-8"
          size="lg"
        >
          {isProcessingPayment ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            <>Confirm & Pay — AED {grandTotal}</>
          )}
        </Button>
      </div>
    </div>
  );
}