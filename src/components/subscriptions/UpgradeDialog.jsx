import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowUpCircle, Star } from 'lucide-react';

export default function UpgradeDialog({ open, onClose, currentSubscription, allPackages, onRequest }) {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentAmt = currentSubscription?.monthly_amount || 0;
  // Show packages more expensive than current (upgrades) or all if re-subscribing
  const upgradable = allPackages.filter(p => p.is_active !== false && p.monthly_price > currentAmt - 1);

  const handleRequest = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    await onRequest(selected);
    setIsSubmitting(false);
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            Select a plan to upgrade to. Our team will contact you to confirm the change.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {upgradable.map(pkg => {
            const isCurrent = pkg.monthly_price === currentAmt;
            const isSelected = selected?.id === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => !isCurrent && setSelected(pkg)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  isCurrent ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' :
                  isSelected ? 'border-emerald-500 bg-emerald-50' :
                  'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{pkg.name}</span>
                      {pkg.popular && <Badge className="bg-amber-100 text-amber-800 text-xs">Popular</Badge>}
                      {isCurrent && <Badge className="bg-slate-200 text-slate-600 text-xs">Current Plan</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{pkg.description}</p>
                    {pkg.features?.length > 0 && (
                      <ul className="space-y-1">
                        {pkg.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-slate-900">AED {pkg.monthly_price?.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">/month</div>
                    {!isCurrent && pkg.monthly_price > currentAmt && (
                      <div className="text-xs text-emerald-600 mt-1">+AED {(pkg.monthly_price - currentAmt).toLocaleString()}/mo</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleRequest}
            disabled={!selected || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? 'Sending Request...' : 'Request Upgrade'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}