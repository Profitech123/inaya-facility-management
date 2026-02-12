import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, MapPin, Printer, ArrowRight, PlusCircle, Headphones, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function BookingConfirmation({ booking, service, property, provider }) {
  const navigate = useNavigate();
  const printRef = useRef();

  const bookingRef = booking?.id ? `BK-${booking.id.slice(0, 5).toUpperCase()}` : 'BK-00000';

  const handlePrint = () => {
    const printContent = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Booking Confirmation - ${bookingRef}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
        .header { text-align: center; margin-bottom: 32px; }
        .header h1 { font-size: 28px; margin: 8px 0 4px; }
        .header p { color: #64748b; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .ref { color: #10b981; font-size: 22px; font-weight: 700; }
        .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-size: 14px; font-weight: 500; }
        .grid { display: flex; gap: 32px; margin-top: 16px; }
        .grid-item { flex: 1; }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
      </style></head><body>
        <div class="header">
          <h1>Booking Confirmed!</h1>
          <p>Your service request has been successfully placed.</p>
        </div>
        <div class="card">
          <div class="label">BOOKING REFERENCE</div>
          <div class="ref">#${bookingRef}</div>
          <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;">
          <div style="font-size:18px;font-weight:600;margin-bottom:12px;">${service?.name || 'Service'}</div>
          <div class="grid">
            <div class="grid-item">
              <div class="label">SCHEDULED DATE</div>
              <div class="value">${booking?.scheduled_date ? format(new Date(booking.scheduled_date), 'MMMM d, yyyy') : '—'}</div>
            </div>
            <div class="grid-item">
              <div class="label">ARRIVAL WINDOW</div>
              <div class="value">${booking?.scheduled_time || '—'}</div>
            </div>
          </div>
          <div style="margin-top:12px;">
            <div class="label">LOCATION</div>
            <div class="value">${property?.address || '—'}${property?.area ? ', ' + property.area : ''}, Dubai, UAE</div>
          </div>
          ${provider ? `<div style="margin-top:12px;"><div class="label">ASSIGNED TECHNICIAN</div><div class="value">${provider.full_name}</div></div>` : ''}
          ${booking?.total_amount ? `<div style="margin-top:12px;"><div class="label">TOTAL AMOUNT</div><div class="value" style="color:#10b981;font-size:18px;">AED ${booking.total_amount}</div></div>` : ''}
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} INAYA Facilities Management. All rights reserved.</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto" ref={printRef}>
        {/* Success Icon & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500">Your service request has been successfully placed.</p>
        </div>

        {/* Main Confirmation Card */}
        <Card className="border-slate-200 shadow-md overflow-hidden mb-6">
          <CardContent className="p-6">
            {/* Booking Reference & Print */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Booking Reference</div>
                <div className="text-2xl font-bold text-emerald-600">#{bookingRef}</div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors font-medium"
              >
                <Printer className="w-4 h-4" />
                Print Confirmation
              </button>
            </div>

            <div className="border-t border-slate-100 pt-5">
              {/* Service Info with Image */}
              <div className="flex gap-4 mb-5">
                {service?.image_url && (
                  <div className="w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900">{service?.name || 'Service'}</h3>
                  {service?.duration_minutes && (
                    <span className="text-xs text-emerald-600 font-medium">
                      ~ {service.duration_minutes} min estimated
                    </span>
                  )}
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                        <Calendar className="w-3 h-3" /> Scheduled Date
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {booking?.scheduled_date ? format(new Date(booking.scheduled_date), 'MMMM d, yyyy') : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                        <Clock className="w-3 h-3" /> Arrival Window
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {booking?.scheduled_time || '—'}
                      </div>
                    </div>
                  </div>

                  {property && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">
                        <MapPin className="w-3 h-3" /> Location
                      </div>
                      <div className="text-sm font-medium text-slate-800">
                        {property.address}{property.area ? `, ${property.area}` : ''}, Dubai, UAE
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technician & Amount */}
              {(provider || booking?.total_amount) && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {provider && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                        {provider.profile_image ? (
                          <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Technician</div>
                        <div className="text-sm font-semibold text-slate-800">{provider.full_name}</div>
                      </div>
                    </div>
                  )}
                  {booking?.total_amount && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Amount</div>
                      <div className="text-lg font-bold text-emerald-600">AED {booking.total_amount}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="border-emerald-200 bg-emerald-50/50 mb-6">
          <CardContent className="p-5">
            <h3 className="font-bold text-slate-900 mb-3">What happens next?</h3>
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                <p>A qualified technician is being assigned to your request. Our team will review the requirements and match the best expert for the job.</p>
                <p className="mt-2">
                  <span className="font-semibold text-slate-800">Status Update:</span> You will receive an email notification once the technician is dispatched and on their way to your location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="bg-emerald-600 hover:bg-emerald-700 h-12 gap-2 text-sm font-semibold"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('OnDemandServices'))}
            variant="outline"
            className="h-12 gap-2 text-sm font-semibold border-slate-300"
          >
            <PlusCircle className="w-4 h-4" /> Book Another Service
          </Button>
        </div>

        {/* Support Link */}
        <div className="text-center text-sm text-slate-400">
          Need to make changes?{' '}
          <Link to={createPageUrl('Support')} className="text-emerald-600 hover:text-emerald-700 font-medium">
            Contact Support
          </Link>
        </div>

        <div className="text-center text-xs text-slate-300 mt-8">
          &copy; {new Date().getFullYear()} INAYA Facilities Management. All rights reserved.
        </div>
      </div>
    </div>
  );
}