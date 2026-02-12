import React from 'react';
import { Award, Shield, Users, Clock } from 'lucide-react';

const stats = [
  { icon: Users, value: "700+", label: "Expert Team Members" },
  { icon: Clock, value: "24/7", label: "Service & Maintenance" },
  { icon: Award, value: "ISO Certified", label: "HSEEQ Standards" },
  { icon: Shield, value: "549+", label: "Hectares Managed" }
];

export default function TrustSignals() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            A Member of Belhasa Group
          </h2>
          <p className="text-xl text-slate-600">
            One of the UAE's most established group of companies, with both the resources and solid financial base to offer leading expertise.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 grid md:grid-cols-4 gap-4">
          {[
            { src: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&q=80", alt: "ISO 9001" },
            { src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80", alt: "ISO 14001" },
            { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80", alt: "ISO 45001" },
            { src: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80", alt: "Excellence" }
          ].map((cert, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-6 flex items-center justify-center h-24 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-sm font-semibold text-slate-700">{cert.alt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}