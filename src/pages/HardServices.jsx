import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Zap, Droplets, Wind, Paintbrush, Flame, Gauge, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const hardServices = [
  { icon: Wind, title: "HVAC Maintenance", desc: "Complete air conditioning and ventilation system maintenance, repair and installation for optimal indoor climate control." },
  { icon: Zap, title: "Electrical Services", desc: "Full electrical maintenance including lighting, power distribution, panel boards, and emergency systems." },
  { icon: Droplets, title: "Plumbing Services", desc: "Comprehensive plumbing maintenance covering water supply, drainage, sanitary fittings and water heaters." },
  { icon: Wrench, title: "MEP Maintenance", desc: "Preventive and corrective maintenance for all mechanical, electrical and plumbing systems." },
  { icon: Flame, title: "Fire & Life Safety", desc: "Fire alarm systems, fire fighting equipment, sprinklers, smoke detectors, and emergency evacuation systems." },
  { icon: Gauge, title: "BMS & Controls", desc: "Building Management System monitoring, maintenance and optimization for energy efficiency." },
  { icon: Paintbrush, title: "Civil & Painting Works", desc: "Structural repairs, masonry, waterproofing, tiling, plastering and internal/external painting." },
  { icon: Wrench, title: "Elevator & Escalator", desc: "Lift and escalator maintenance, modernization and emergency rescue services." },
];

export default function HardServices() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-emerald-400 font-semibold mb-2">Facilities Management</p>
          <h1 className="text-5xl font-bold mb-6">Hard Services</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Our hard services cover all aspects of building maintenance including MEP systems, HVAC, electrical, plumbing, fire safety, civil works and more. We ensure your property's technical systems operate at peak performance.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-600">{service.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 bg-slate-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Choose Our Hard Services?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "24/7 emergency response team",
                "Certified and experienced technicians",
                "Preventive maintenance programs",
                "Energy efficiency optimization",
                "Full compliance with local codes",
                "Comprehensive reporting & analytics"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to={createPageUrl('Services')}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 mr-4">
                Book a Hard Service
              </Button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" variant="outline">
                <Phone className="w-4 h-4 mr-2" /> Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}