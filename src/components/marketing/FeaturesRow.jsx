import React from 'react';
import { ShieldCheck, CalendarCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: ShieldCheck,
    title: "Reliable Technicians",
    description: "Vetted professionals ensuring high-quality service every time.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Slot Booking",
    description: "Schedule services at your convenience through our app or web.",
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    description: "Track your technician's arrival in real-time for peace of mind.",
  },
];

export default function FeaturesRow() {
  return (
    <section className="bg-white py-12 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
