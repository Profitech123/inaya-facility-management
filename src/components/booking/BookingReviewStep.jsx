import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, Wrench, Plus, Receipt } from 'lucide-react';

export default function BookingReviewStep({ service, property, bookingData, selectedAddons, provider, grandTotal, addonsTotal }) {
  return (
    <div className="space-y-5">
      {/* Service Details */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-600" />
            Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-slate-900">{service?.name}</p>
              {service?.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{service.description}</p>
              )}
              {service?.duration_minutes && (
                <p className="text-xs text-slate-400 mt-1">Est. duration: {service.duration_minutes} min</p>
              )}
            </div>
            <span className="text-lg font-bold text-slate-900">AED {service?.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Property */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Schedule & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700">
              {bookingData.scheduled_date ? format(bookingData.scheduled_date, 'EEEE, MMMM d, yyyy') : '—'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700">{bookingData.scheduled_time || '—'}</span>
          </div>
          {property && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700">{property.address} ({property.property_type})</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technician */}
      {provider && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Preferred Technician
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 font-medium">{provider.full_name}</p>
          </CardContent>
        </Card>
      )}

      {/* Add-ons */}
      {selectedAddons.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedAddons.map(addon => (
                <div key={addon.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{addon.name}</span>
                  <span className="font-medium text-slate-900">AED {addon.price}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Add-ons subtotal</span>
                <span className="font-semibold text-slate-700">AED {addonsTotal}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {bookingData.customer_notes && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{bookingData.customer_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{service?.name}</span>
            <span className="text-slate-900">AED {service?.price}</span>
          </div>
          {selectedAddons.map(addon => (
            <div key={addon.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{addon.name}</span>
              <span className="text-slate-900">AED {addon.price}</span>
            </div>
          ))}
          <div className="border-t border-emerald-200 pt-3 mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-lg font-bold text-emerald-700">AED {grandTotal}</span>
          </div>
          <p className="text-xs text-slate-400">VAT included where applicable</p>
        </CardContent>
      </Card>
    </div>
  );
}