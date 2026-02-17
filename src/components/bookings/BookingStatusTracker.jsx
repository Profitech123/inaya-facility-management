import React from 'react';
import { CheckCircle2, Circle, Clock, Truck, Wrench, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STEPS = [
  { key: 'pending', label: 'Booking Placed', desc: 'Your request is being reviewed', icon: Clock, color: 'amber' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Technician assigned & scheduled', icon: CheckCircle2, color: 'blue' },
  { key: 'en_route', label: 'En Route', desc: 'Technician is on the way', icon: Truck, color: 'indigo' },
  { key: 'in_progress', label: 'In Progress', desc: 'Service is being performed', icon: Wrench, color: 'purple' },
  { key: 'completed', label: 'Completed', desc: 'Service completed successfully', icon: CheckCircle2, color: 'emerald' },
];

const colorMap = {
  amber: { active: 'bg-amber-500 border-amber-500 text-white', ring: 'ring-amber-100', text: 'text-amber-600' },
  blue: { active: 'bg-blue-500 border-blue-500 text-white', ring: 'ring-blue-100', text: 'text-blue-600' },
  indigo: { active: 'bg-indigo-500 border-indigo-500 text-white', ring: 'ring-indigo-100', text: 'text-indigo-600' },
  purple: { active: 'bg-purple-500 border-purple-500 text-white', ring: 'ring-purple-100', text: 'text-purple-600' },
  emerald: { active: 'bg-emerald-500 border-emerald-500 text-white', ring: 'ring-emerald-100', text: 'text-emerald-600' },
};

export default function BookingStatusTracker({ booking }) {
  if (booking.status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-700">Booking Cancelled</p>
            {booking.cancelled_at && <p className="text-xs text-red-500">{format(new Date(booking.cancelled_at), 'MMM d, yyyy h:mm a')}</p>}
            {booking.cancellation_reason && <p className="text-sm text-red-600 mt-1">{booking.cancellation_reason}</p>}
          </div>
        </div>
        {booking.cancellation_fee > 0 && (
          <div className="mt-3 text-sm text-red-600 bg-red-100 rounded-lg px-3 py-2">
            Cancellation fee: AED {booking.cancellation_fee}
          </div>
        )}
      </div>
    );
  }

  if (booking.status === 'delayed') {
    // Show delayed as a special state on the confirmed step
  }

  const currentIdx = STEPS.findIndex(s => s.key === booking.status);
  const activeIdx = booking.status === 'delayed' ? 1 : currentIdx; // delayed shows after confirmed

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const isDone = idx < activeIdx || (idx === activeIdx && booking.status === 'completed');
        const isCurrent = idx === activeIdx && booking.status !== 'completed';
        const isDelayed = booking.status === 'delayed' && idx === 2;
        const Icon = step.icon;
        const colors = colorMap[step.color];

        return (
          <div key={step.key} className="flex gap-4">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                isDone ? "bg-emerald-500 border-emerald-500" :
                isCurrent ? `${colors.active} ring-4 ${colors.ring}` :
                "bg-white border-slate-200"
              )}>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Icon className="w-5 h-5 text-white" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "w-0.5 h-12 my-1",
                  idx < activeIdx ? "bg-emerald-400" : "bg-slate-200"
                )} />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6", idx === STEPS.length - 1 && "pb-0")}>
              <p className={cn(
                "font-semibold text-sm",
                isDone ? "text-emerald-600" :
                isCurrent ? colors.text :
                "text-slate-400"
              )}>
                {step.label}
              </p>
              <p className={cn(
                "text-xs mt-0.5",
                isDone || isCurrent ? "text-slate-500" : "text-slate-300"
              )}>
                {step.desc}
              </p>

              {/* Delayed badge */}
              {isDelayed && (
                <div className="flex items-center gap-2 mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-700">Service Delayed</p>
                    {booking.delay_reason && <p className="text-xs text-orange-600">{booking.delay_reason}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}