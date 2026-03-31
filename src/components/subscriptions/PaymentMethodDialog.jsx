import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, Banknote, CheckCircle2 } from 'lucide-react';

const METHODS = [
  { value: 'card',          label: 'Credit / Debit Card', icon: CreditCard,  desc: 'Visa, Mastercard, AMEX' },
  { value: 'bank_transfer', label: 'Bank Transfer',       icon: Building2,   desc: 'Direct bank payment' },
  { value: 'cash',          label: 'Cash on Visit',       icon: Banknote,    desc: 'Pay during service visit' },
];

export default function PaymentMethodDialog({ open, onClose, currentMethod, onSave }) {
  const [selected, setSelected] = useState(currentMethod || 'card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave(selected);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-600" />
            Update Payment Method
          </DialogTitle>
          <DialogDescription>
            Choose your preferred payment method for this subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {METHODS.map(m => {
            const Icon = m.icon;
            const isActive = selected === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setSelected(m.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  isActive ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-500">{m.desc}</p>
                </div>
                {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800">
            {isSubmitting ? 'Saving...' : 'Save Payment Method'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}