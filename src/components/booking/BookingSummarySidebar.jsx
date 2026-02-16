import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Calendar, Clock, MapPin, User, Package, StickyNote, Wrench } from 'lucide-react';
import { format } from 'date-fns';

const TOTAL_STEPS = 5;

export default function BookingSummarySidebar({
  service,
  bookingData,
  selectedProperty,
  selectedAddons,
  selectedProvider,
  grandTotal,
  currentStep,
}) {
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Service */}
        {service ? (
          <>
            <div className="flex items-start gap-2">
              <Wrench className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="font-medium text-slate-900">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Base price</span>
              <span className="text-slate-900">AED {service.price}</span>
            </div>
          </>
        ) : (
          <div className="text-slate-400 text-xs italic">No service selected yet</div>
        )}

        {/* Property */}
        {selectedProperty && (
          <div className="flex items-start gap-2 pt-2 border-t">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-slate-700 text-xs">{selectedProperty.address}</span>
              <span className="text-slate-400 text-xs capitalize block">{selectedProperty.property_type}{selectedProperty.bedrooms ? ` • ${selectedProperty.bedrooms} BR` : ''}</span>
            </div>
          </div>
        )}

        {/* Schedule */}
        {bookingData.scheduled_date && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 text-xs">{format(bookingData.scheduled_date, 'EEE, MMM d, yyyy')}</span>
          </div>
        )}
        {bookingData.scheduled_time && (
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 text-xs">{bookingData.scheduled_time}</span>
          </div>
        )}

        {/* Add-ons */}
        {selectedAddons.length > 0 && (
          <div className="pt-2 border-t space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Package className="w-3 h-3" /> Add-ons
            </div>
            {selectedAddons.map(a => (
              <div key={a.id} className="flex justify-between text-xs">
                <span className="text-slate-500">{a.name}</span>
                <span className="text-slate-700">+AED {a.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Technician */}
        {selectedProvider && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 text-xs">{selectedProvider.full_name}</span>
          </div>
        )}

        {/* Notes */}
        {bookingData.customer_notes && currentStep >= 4 && (
          <div className="flex items-start gap-2 pt-2 border-t">
            <StickyNote className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-600 text-xs line-clamp-2">{bookingData.customer_notes}</span>
          </div>
        )}

        {/* Total */}
        <div className="border-t pt-3 mt-2">
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-emerald-700">AED {grandTotal}</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="pt-2">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
          <Shield className="w-3.5 h-3.5" />
          Secure payment · Free cancellation up to 4h before
        </div>
      </CardContent>
    </Card>
  );
}