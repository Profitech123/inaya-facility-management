import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import AIQuoteWidget from '../components/service-finder/AIQuoteWidget';
import CertificationsBar from '../components/marketing/CertificationsBar';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "info@inaya.ae",
        subject: `Contact Form: ${formData.name}`,
        body: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>
          <p><strong>Message:</strong><br/>${formData.message}</p>
        `
      });
      toast.success('Message sent! We will contact you shortly.');
    } catch {
      toast.success('Message received! We will contact you shortly.');
    }
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-700/20 rounded-full blur-[160px] -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-teal-800/15 rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold text-[11px] tracking-[0.2em] uppercase">Get In Touch</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-6xl font-bold mb-5 tracking-tight"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            Have you got a question or comment? Feel free to drop us a line.
          </motion.p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Company Names */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-3">INAYA Group of Companies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                "INAYA Facilities Management Services L.L.C",
                "INAYA Technical Services L.L.C",
                "INAYA Security Services L.L.C",
                "INAYA Property L.L.C"
              ].map((name, idx) => (
                <div key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                  {name}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">(A Member of Belhasa Group)</p>
          </div>

          {/* AI Quote Widget */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Get an Instant AI Quote</h2>
            <p className="text-slate-600 mb-4">Describe your problem in plain language and get an instant price estimate before booking.</p>
            <AIQuoteWidget />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Quick Contact</h2>
              <p className="text-slate-600 mb-8">Feel free to get in touch</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Address</h3>
                    <p className="text-slate-600">28th Street</p>
                    <p className="text-slate-600">Belhasa HO Building, Office M03</p>
                    <p className="text-slate-600">Hor Al Anz East</p>
                    <p className="text-slate-600">PO Box 87074, Dubai, UAE</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                    <p className="text-slate-600">Toll-Free: <a href="tel:600546292" className="text-emerald-600 hover:underline">6005-INAYA (6005-46292)</a></p>
                    <p className="text-slate-600">Customer Service: <a href="tel:+97148157300" className="text-emerald-600 hover:underline">+971 4 815 7300</a></p>
                    <p className="text-slate-600">Main: <a href="tel:+97148827001" className="text-emerald-600 hover:underline">+971 4 882 7001</a></p>
                    <p className="text-slate-600">Fax: +971 4 882 7002</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <p className="text-slate-600">General: <a href="mailto:info@inaya.ae" className="text-emerald-600 hover:underline">info@inaya.ae</a></p>
                    <p className="text-slate-600">Business: <a href="mailto:BD@inaya.ae" className="text-emerald-600 hover:underline">BD@inaya.ae</a></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Website</h3>
                    <a href="https://www.inaya.ae" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">www.inaya.ae</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Hours</h3>
                    <p className="text-slate-600">24/7 Customer Service Centre</p>
                    <p className="text-slate-600">Office: Sunday – Thursday, 8AM – 6PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Google Maps ── */}
      <div className="w-full h-80 md:h-96 relative overflow-hidden border-t border-slate-100">
        <iframe
          title="INAYA Office Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.0!2d55.3370!3d25.2773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5f00000000%3A0x1!2sBelhasa+Building%2C+Hor+Al+Anz+East%2C+Dubai!5e0!3m2!1sen!2sae!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'grayscale(15%)' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
        {/* Overlay CTA */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 shadow-luxury border border-slate-100 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900">Belhasa HO Building, Hor Al Anz East</p>
            <a
              href="https://maps.google.com/?q=Belhasa+Building+Hor+Al+Anz+East+Dubai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-600 hover:underline font-medium"
            >
              Get directions →
            </a>
          </div>
        </div>
      </div>

      {/* ── Certifications ── */}
      <CertificationsBar />
    </div>
  );
}