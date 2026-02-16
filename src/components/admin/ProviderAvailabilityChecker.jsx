import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

/**
 * Checks provider availability against blockouts and existing bookings.
 * Returns availability info for each provider.
 */
export function getProviderAvailability(provider, date, timeSlot, blockouts, bookings) {
  if (!date) return { status: 'unknown', label: 'Select date first' };
  if (!provider.is_active) return { status: 'unavailable', label: 'Inactive' };

  // Check blockouts
  const providerBlockouts = blockouts.filter(b => b.provider_id === provider.id);
  const dayOfWeek = new Date(date).getDay();

  const isBlockedOut = providerBlockouts.some(b => {
    // Direct date match
    if (b.date === date) {
      if (b.time_slot === 'all_day') return true;
      if (timeSlot && b.time_slot === timeSlot) return true;
      if (!timeSlot) return true;
    }
    // Recurring weekly blockout
    if (b.is_recurring && b.recurring_day === dayOfWeek) {
      if (b.time_slot === 'all_day') return true;
      if (timeSlot && b.time_slot === timeSlot) return true;
    }
    return false;
  });

  if (isBlockedOut) {
    const reason = providerBlockouts.find(b => b.date === date || (b.is_recurring && b.recurring_day === dayOfWeek))?.reason;
    return { status: 'blocked', label: `Blocked: ${reason || 'Unavailable'}` };
  }

  // Check existing bookings on same date/time
  const conflictingBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const isAssigned = b.assigned_provider_id === provider.id ||
      (b.assigned_provider_ids || []).includes(provider.id);
    if (!isAssigned) return false;
    if (b.scheduled_date !== date) return false;
    if (timeSlot && b.scheduled_time && b.scheduled_time === timeSlot) return true;
    if (!timeSlot || !b.scheduled_time) return true; // overlap if no time specified
    return false;
  });

  if (conflictingBookings.length > 0) {
    return {
      status: 'busy',
      label: `${conflictingBookings.length} job(s) on this slot`,
      count: conflictingBookings.length
    };
  }

  return { status: 'available', label: 'Available' };
}

export default function ProviderAvailabilityBadge({ availability }) {
  if (!availability) return null;

  const config = {
    available: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    busy: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    blocked: { icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
    unavailable: { icon: XCircle, className: 'bg-slate-100 text-slate-500 border-slate-200' },
    unknown: { icon: Clock, className: 'bg-slate-50 text-slate-400 border-slate-200' },
  }[availability.status] || { icon: Clock, className: 'bg-slate-50 text-slate-400' };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {availability.label}
    </span>
  );
}