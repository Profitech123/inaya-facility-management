import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Landmark, ShieldCheck, Loader2 } from 'lucide-react';

export default function StepBankDetails({ provider, onUpdate, onNext, onBack }) {
  const [form, setForm] = useState({
    bank_name: provider.bank_name || '',
    bank_account_name: provider.bank_account_name || '',
    bank_iban: provider.bank_iban || '',
    bank_swift: provider.bank_swift || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(form);
    setSaving(false);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Bank Details</h2>
        <p className="text-slate-500 text-sm mt-1">Provide your bank details for receiving payments</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Secure & Private</strong>
          <p className="text-blue-600 mt-0.5">Your bank information is encrypted and only accessible by INAYA's finance team for payment processing.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Bank Name</Label>
          <Input
            value={form.bank_name}
            onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
            placeholder="e.g., Emirates NBD, ADCB, Mashreq"
          />
        </div>
        <div>
          <Label>Account Holder Name</Label>
          <Input
            value={form.bank_account_name}
            onChange={e => setForm(f => ({ ...f, bank_account_name: e.target.value }))}
            placeholder="Full name as on bank account"
          />
        </div>
        <div>
          <Label>IBAN</Label>
          <Input
            value={form.bank_iban}
            onChange={e => setForm(f => ({ ...f, bank_iban: e.target.value }))}
            placeholder="AE070331234567890123456"
            className="font-mono tracking-wide"
          />
          <p className="text-[11px] text-slate-400 mt-1">UAE IBANs start with "AE" followed by 21 digits</p>
        </div>
        <div>
          <Label>SWIFT / BIC Code</Label>
          <Input
            value={form.bank_swift}
            onChange={e => setForm(f => ({ ...f, bank_swift: e.target.value }))}
            placeholder="e.g., EABORAMKXXX"
            className="font-mono uppercase"
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
        You can skip this step and add bank details later from your settings. However, payments cannot be processed without valid bank details.
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onNext} className="text-slate-500">Skip for now</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}