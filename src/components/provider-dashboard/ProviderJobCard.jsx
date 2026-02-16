import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, User, ChevronRight, AlertTriangle } from 'lucide-react';
import moment from 'moment';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  en_route: { label: 'En Route', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  delayed: { label: 'Delayed', color: 'bg-red-100 text-red-700 border-red-200' },
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export default function ProviderJobCard({ booking, service, property, customer, onSelect }) {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const isToday = moment(booking.scheduled_date).isSame(moment(), 'day');
  const isPast = moment(booking.scheduled_date).isBefore(moment(), 'day');

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
        isToday ? 'border-l-emerald-500' : isPast ? 'border-l-slate-300' : 'border-l-blue-400'
      }`}
      onClick={() => onSelect(booking)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className={`text-[10px] ${status.color}`}>{status.label}</Badge>
              {isToday && <Badge className="bg-emerald-600 text-white text-[10px]">Today</Badge>}
              {booking.status === 'delayed' && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </div>
            <h3 className="font-semibold text-slate-900 truncate">{service?.name || 'Service'}</h3>
            
            <div className="mt-2 space-y-1 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{moment(booking.scheduled_date).format('ddd, MMM D')} · {booking.scheduled_time || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{property?.address || property?.area || 'Address pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{customer?.full_name || 'Customer'}</span>
              </div>
            </div>

            {booking.customer_notes && (
              <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">"{booking.customer_notes}"</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-bold text-slate-900">AED {booking.total_amount}</span>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}