import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Send, Loader2, MessageSquareQuote } from 'lucide-react';

export default function QuoteForm({ prefillQuery = '' }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    property_type: '',
    service_need: prefillQuery,
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    await base44.integrations.Core.SendEmail({
      to: "info@inaya.ae",
      subject: `Service Finder Quote: ${form.service_need || 'General'} — ${form.name}`,
      body: `
        <h2>Quote Request from Service Finder</h2>
        <p><strong>Name:</strong> ${form.name}</p>
        <p><strong>Email:</strong> ${form.email}</p>
        <p><strong>Phone:</strong> ${form.phone || 'N/A'}</p>
        <p><strong>Property Type:</strong> ${form.property_type || 'Not specified'}</p>
        <p><strong>Service Need:</strong> ${form.service_need || 'General inquiry'}</p>
        <p><strong>Additional Details:</strong><br/>${form.message || 'None'}</p>
      `
    });

    toast.success("Quote request sent! We'll get back to you within 24 hours.");
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/80">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquareQuote className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Quote Request Submitted!</h3>
          <p className="text-slate-600">Our team will review your request and get back to you within 24 hours.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', property_type: '', service_need: prefillQuery, message: '' }); }}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Request a Custom Quote</CardTitle>
            <p className="text-sm text-slate-500">Can't find what you need? Get a personalized quote within 24 hours.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Name *</label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
              <Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+971 XX XXX XXXX" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Property Type</label>
              <Select value={form.property_type} onValueChange={v => setForm({...form, property_type: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="office">Office / Commercial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">What service do you need? *</label>
            <Input value={form.service_need} onChange={e => setForm({...form, service_need: e.target.value})} required placeholder="e.g. Full villa deep clean, AC overhaul, etc." />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Additional Details</label>
            <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} placeholder="Property size, special requirements, preferred timing..." />
          </div>
          <Button type="submit" disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto h-11 px-8 gap-2">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Request Quote</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}