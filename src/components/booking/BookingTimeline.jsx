import React from 'react';
import { CheckCircle2, Clock, Wrench, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-300' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500 bg-blue-50 border-blue-300' },
  { key: 'in_progress', label: 'In Progress', icon: Wrench, color: 'text-purple-500 bg-purple-50 border-purple-300' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-300' },
];

export default function BookingTimeline({ booking }) {
  const isCancelled = booking.status === 'cancelled';
  const currentIdx = STEPS.findIndex(s => s.key === booking.status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <span className="text-sm font-medium text-red-700">Booking Cancelled</span>
          {booking.completed_at && (
            <p className="text-xs text-red-500">{format(new Date(booking.completed_at), 'MMM d, yyyy')}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full gap-0">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                isDone ? "bg-emerald-500 border-emerald-500" :
                isCurrent ? step.color :
                "bg-slate-100 border-slate-200"
              )}>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Icon className={cn("w-4 h-4", isCurrent ? "" : "text-slate-400")} />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium text-center whitespace-nowrap",
                isDone ? "text-emerald-600" :
                isCurrent ? "text-slate-900" :
                "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-1 rounded-full",
                idx < currentIdx ? "bg-emerald-500" : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}