import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function QuoteRequestDialog({ open, onOpenChange, selectedServices, services, addons, selectedAddonIds, duration, propertyType, monthlyPrice }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);

    const serviceNames = selectedServices.map(s => {
      const svc = services.find(sv => sv.id === s.service_id);
      return `${svc?.name || 'Service'} (${s.frequency})`;
    });
    const addonNames = addons.filter(a => selectedAddonIds.includes(a.id)).map(a => a.name);

    const body = `
      <h2>New Custom Package Quote Request</h2>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Area:</strong> ${area || 'Not specified'}</p>
      <p><strong>Property Type:</strong> ${propertyType}</p>
      <p><strong>Duration:</strong> ${duration} month(s)</p>
      <hr/>
      <h3>Selected Services:</h3>
      <ul>${serviceNames.map(s => `<li>${s}</li>`).join('')}</ul>
      ${addonNames.length > 0 ? `<h3>Add-ons:</h3><ul>${addonNames.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
      <p><strong>Estimated Monthly Price:</strong> AED ${monthlyPrice.toLocaleString()}</p>
      ${notes ? `<h3>Additional Notes:</h3><p>${notes}</p>` : ''}
    `;

    await base44.integrations.Core.SendEmail({
      to: 'info@inaya.ae',
      subject: `Custom Package Quote Request from ${name}`,
      body,
    });

    setSending(false);
    setSent(true);
    toast.success('Quote request sent successfully!');
  };

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSent(false); }}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Request Sent!</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Our team will review your custom package and get back to you within 24 hours with a tailored quote.
            </p>
            <Button onClick={() => { onOpenChange(false); setSent(false); }} className="mt-6 bg-emerald-600 hover:bg-emerald-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Custom Quote</DialogTitle>
          <DialogDescription>
            Fill in your details and our team will send you a personalized quote within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Phone *</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 123 4567" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Area / Community</label>
              <Input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Dubai Marina" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Additional Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements..." rows={3} />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">{selectedServices.length} service(s) selected</span>
              <span className="font-semibold text-emerald-600">~AED {monthlyPrice.toLocaleString()}/mo</span>
            </div>
            <p className="text-xs text-slate-400">Final pricing may vary based on property assessment</p>
          </div>

          <Button type="submit" disabled={sending} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 gap-2">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Quote Request</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}