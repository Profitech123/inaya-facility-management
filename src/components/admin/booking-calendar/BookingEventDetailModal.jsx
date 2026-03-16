import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Wrench, CreditCard } from 'lucide-react';
import { STATUS_COLORS, statusLabel } from './calendarUtils';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function BookingEventDetailModal({ booking, service, provider, onClose }) {
  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;

  const formatDate = (d) => {
    if (!d) return '—';
    try { return format(new Date(d.replace(/-/g, '/')), 'EEE, MMM d, yyyy'); } catch { return d; }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-500" />
            {service?.name || 'Booking Detail'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status badge */}
          <div>
            <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
              {statusLabel(booking.status)}
            </Badge>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{formatDate(booking.scheduled_date)}</span>
            </div>
            {booking.scheduled_time && (
              <div className="flex items-center gap-3 text-slate-700">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{booking.scheduled_time}</span>
              </div>
            )}
            {provider && (
              <div className="flex items-center gap-3 text-slate-700">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{provider.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-700">
              <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>AED {booking.total_amount?.toFixed(2) || '0.00'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {booking.payment_status || 'pending'}
              </span>
            </div>
            {booking.customer_notes && (
              <div className="bg-slate-50 rounded-lg p-3 text-slate-600 text-xs">
                <p className="font-medium text-slate-500 mb-1">Customer Notes</p>
                {booking.customer_notes}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to={`${createPageUrl('AdminBookings')}?booking=${booking.id}`}
              onClick={onClose}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View full booking details →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}