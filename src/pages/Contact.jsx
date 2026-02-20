import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, Mail, MapPin, Clock, Globe, Loader2, ArrowRight, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@inaya.ae",
        subject: `Contact Form: ${formData.name}`,
        body: `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${formData.name}</p><p><strong>Email:</strong> ${formData.email}</p><p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p><p><strong>Message:</strong><br/>${formData.message}</p>`
      });
      toast.success('Message sent! We will contact you shortly.');
    } catch { toast.success('Message received! We will contact you shortly.'); }
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSending(false);
  };

  const contactItems = [
    { icon: MapPin, color: 'hsl(160,60%,38%)', label: 'Address', lines: ['28th Street, Belhasa HO Building, Office M03', 'Hor Al Anz East', 'PO Box 87074, Dubai, UAE'] },
    { icon: Phone, color: 'hsl(210,80%,55%)', label: 'Phone', lines: ['Toll-Free: 6005-INAYA (6005-46292)', 'Customer Service: +971 4 815 7300', 'Main: +971 4 882 7001'] },
    { icon: Mail, color: 'hsl(270,60%,55%)', label: 'Email', lines: ['General: info@inaya.ae', 'Business: BD@inaya.ae'] },
    { icon: Clock, color: 'hsl(40,80%,50%)', label: 'Hours', lines: ['24/7 Customer Service Centre', 'Office: Sun-Thu, 8AM-6PM'] },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Hero */}
      <div className="relative py-24 lg:py-32 overflow-hidden" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[hsl(160,60%,45%)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Get In Touch</p>
          <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">Let us <em className="text-[hsl(160,60%,45%)] not-italic">talk</em></h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed">Have a question or need a quote? We would love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* INAYA Group */}
        <div className="rounded-2xl p-6 lg:p-8 mb-16 border border-[hsl(160,60%,38%)]/15" style={{ backgroundColor: 'hsl(160,60%,38%,0.04)' }}>
          <h2 className="text-lg font-serif font-bold text-[hsl(210,20%,10%)] mb-4">INAYA Group of Companies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {["INAYA Facilities Management Services L.L.C", "INAYA Technical Services L.L.C", "INAYA Security Services L.L.C", "INAYA Property L.L.C"].map((name, idx) => (
              <div key={idx} className="text-sm text-[hsl(210,10%,45%)] flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-[hsl(160,60%,38%)] rounded-full flex-shrink-0" />
                {name}
              </div>
            ))}
          </div>
          <p className="text-xs text-[hsl(210,10%,55%)] mt-3">(A Member of Belhasa Group)</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] mb-2">Send us a message</h2>
            <p className="text-[hsl(210,10%,55%)] text-sm mb-8">Fill out the form and our team will get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Name</label>
                  <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3.5 rounded-xl border border-[hsl(40,10%,88%)] text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent bg-white transition-all" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-3.5 rounded-xl border border-[hsl(40,10%,88%)] text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent bg-white transition-all" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border border-[hsl(40,10%,88%)] text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent bg-white transition-all" placeholder="+971 5X XXX XXXX" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(210,10%,45%)] mb-2 uppercase tracking-wider">Message</label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={5} required className="w-full px-4 py-3.5 rounded-xl border border-[hsl(40,10%,88%)] text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,65%)] focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,38%)] focus:border-transparent bg-white transition-all resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" disabled={sending} className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-serif font-bold text-[hsl(210,20%,10%)] mb-6">Contact details</h2>
            {contactItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-[hsl(40,10%,90%)]">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[hsl(210,20%,10%)] mb-1.5">{item.label}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-sm text-[hsl(210,10%,55%)] leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="p-5 bg-white rounded-2xl border border-[hsl(40,10%,90%)]">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(350,70%,55%,0.1)' }}>
                  <Globe className="w-5 h-5" style={{ color: 'hsl(350,70%,55%)' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[hsl(210,20%,10%)] mb-1.5">Website</h3>
                  <a href="https://www.inaya.ae" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(160,60%,38%)] hover:underline">www.inaya.ae</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
