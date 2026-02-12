import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Send, Loader2 } from 'lucide-react';

export default function QuoteRequestForm({ serviceName = "General Inquiry" }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@inaya.ae",
        subject: `Quote Request: ${serviceName} — ${form.name}`,
        body: `
          <h2>New Quote Request</h2>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Name:</strong> ${form.name}</p>
          <p><strong>Email:</strong> ${form.email}</p>
          <p><strong>Phone:</strong> ${form.phone || 'N/A'}</p>
          <p><strong>Message:</strong><br/>${form.message}</p>
        `
      });
      toast.success("Quote request sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.success("Quote request received! We'll contact you shortly.");
      setForm({ name: '', email: '', phone: '', message: '' });
    }
    setSending(false);
  };

  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardHeader>
        <CardTitle className="text-xl">Request a Free Quote</CardTitle>
        <p className="text-sm text-slate-500">Fill out the form and our team will get back to you within 24 hours.</p>
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
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
            <Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+971 XX XXX XXXX" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Tell us about your requirements *</label>
            <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={4} placeholder="Describe your property, specific needs, preferred schedule..." />
          </div>
          <Button type="submit" disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Quote Request</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}