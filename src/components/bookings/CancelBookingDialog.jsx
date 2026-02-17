import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { getCancellationDetails, CANCELLATION_POLICY } from './CancellationPolicyHelper';

const CANCEL_REASONS = [
  "Change of plans",
  "Found another provider",
  "No longer need the service",
  "Scheduling conflict",
  "Cost concerns",
  "Other",
];

export default function CancelBookingDialog({ open, onOpenChange, booking, onConfirm, isLoading }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const cancellation = getCancellationDetails(booking);

  const tierStyles = {
    free: { icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
    late: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
    sameday: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-700', iconColor: 'text-red-500' },
    blocked: { icon: XCircle, bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', iconColor: 'text-slate-500' },
  };

  const style = tierStyles[cancellation.tier] || tierStyles.blocked;
  const TierIcon = style.icon;

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    onConfirm({
      reason,
      feeAmount: cancellation.feeAmount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Cancel Booking</DialogTitle>
          <DialogDescription>
            Review the cancellation policy below before proceeding.
          </DialogDescription>
        </DialogHeader>

        {/* Policy banner */}
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${style.bg}`}>
          <TierIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
          <div>
            <p className={`text-sm font-semibold ${style.text}`}>{cancellation.reason}</p>
            {cancellation.allowed && booking.payment_status === 'paid' && (
              <div className="mt-2 space-y-1 text-sm">
                {cancellation.feeAmount > 0 && (
                  <p className="text-slate-600">Cancellation fee: <strong>AED {cancellation.feeAmount}</strong></p>
                )}
                <p className="text-slate-600">
                  Refund amount: <strong className="text-emerald-600">AED {cancellation.refundAmount}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Policy details */}
        <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancellation Policy</span>
          </div>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• Free cancellation: {CANCELLATION_POLICY.freeCancellationHours}+ hours before service</li>
            <li>• Late cancellation: {CANCELLATION_POLICY.lateCancellationFeePercent}% fee ({CANCELLATION_POLICY.sameDayThresholdHours}-{CANCELLATION_POLICY.freeCancellationHours}h before)</li>
            <li>• Same-day cancellation: {CANCELLATION_POLICY.sameDayCancellationFeePercent}% fee (under {CANCELLATION_POLICY.sameDayThresholdHours}h)</li>
          </ul>
        </div>

        {cancellation.allowed && (
          <>
            {/* Reason selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Reason for cancellation</label>
              <div className="grid grid-cols-2 gap-2">
                {CANCEL_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-all border ${
                      selectedReason === reason
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              {selectedReason === 'Other' && (
                <Textarea
                  placeholder="Please describe your reason..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="mt-3"
                  rows={3}
                />
              )}
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Keep Booking
          </Button>
          {cancellation.allowed && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim()) || isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}