import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Pause, XCircle } from 'lucide-react';

const PAUSE_REASONS = [
  "Traveling / away from property",
  "Financial reasons",
  "Seasonal - don't need services now",
  "Trying alternative provider temporarily",
  "Other"
];

const CANCEL_REASONS = [
  "Moving to a different property",
  "Service quality not satisfactory",
  "Too expensive",
  "No longer need the services",
  "Switching to a different provider",
  "Other"
];

export default function PauseCancelDialog({ open, onClose, subscription, action, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const isPause = action === 'pause';
  const reasons = isPause ? PAUSE_REASONS : CANCEL_REASONS;

  const handleConfirm = () => {
    const fullReason = additionalNotes ? `${reason}: ${additionalNotes}` : reason;
    onConfirm(fullReason);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPause ? (
              <><Pause className="w-5 h-5 text-yellow-600" /> Pause Subscription</>
            ) : (
              <><XCircle className="w-5 h-5 text-red-600" /> Cancel Subscription</>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPause
              ? "Your subscription will be paused and services will be put on hold. You can resume anytime."
              : "Your subscription will be cancelled. This action may take effect after the notice period."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isPause && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Cancellation requires 30 days notice. You'll continue to receive services until your current billing period ends.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for {isPause ? 'pausing' : 'cancelling'}
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional notes (optional)
            </label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Tell us more about your reason..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Keep Subscription</Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason || isLoading}
            className={isPause ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isLoading ? 'Processing...' : isPause ? 'Pause Subscription' : 'Cancel Subscription'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}