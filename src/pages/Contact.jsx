import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will contact you shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-slate-300 max-w-2xl">
            Have you got a question or comment? Feel free to drop us a line.
          </p>
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
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full">
                  Send Message
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
    </div>
  );
}