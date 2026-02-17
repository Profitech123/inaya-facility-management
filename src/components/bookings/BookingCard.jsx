import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, parseISO } from 'date-fns';
import BookingTimeline from '../booking/BookingTimeline';

function formatBookingDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr + 'T00:00:00');
    return format(d, 'MMMM d, yyyy');
  } catch { return dateStr; }
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  en_route: { label: 'En Route', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
  delayed: { label: 'Delayed', className: 'bg-orange-100 text-orange-800 border-orange-200' },
};

export default function BookingCard({ booking, serviceName, propertyAddress, providerName }) {
  const status = statusConfig[booking.status] || statusConfig.pending;
  const isActive = ['pending', 'confirmed', 'en_route', 'in_progress', 'delayed'].includes(booking.status);

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${isActive ? 'border-l-4 border-l-emerald-500' : ''}`}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h3 className="font-bold text-slate-900 text-lg truncate">{serviceName}</h3>
                <Badge className={`${status.className} border text-xs font-semibold`}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatBookingDate(booking.scheduled_date)}
                </span>
                {booking.scheduled_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {booking.scheduled_time}
                  </span>
                )}
                {propertyAddress && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {propertyAddress}
                  </span>
                )}
                {providerName && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {providerName}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-slate-900">AED {booking.total_amount}</div>
              <Badge variant="outline" className="mt-1 text-xs">
                {booking.payment_status === 'paid' ? '✓ Paid' : booking.payment_status === 'refunded' ? '↩ Refunded' : 'Unpaid'}
              </Badge>
            </div>
          </div>

          {/* Delay notice */}
          {booking.status === 'delayed' && booking.delay_reason && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Delayed: {booking.delay_reason}</span>
            </div>
          )}

          {/* Timeline + Action */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <BookingTimeline booking={booking} />
            </div>
            <Link to={createPageUrl('BookingDetail') + '?id=' + booking.id}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold flex-shrink-0">
                Details <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}