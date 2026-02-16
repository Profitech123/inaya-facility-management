import React from 'react';
import { ShieldCheck, CalendarCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: ShieldCheck,
    title: "Reliable Technicians",
    desc: "Every professional is certified, background-checked, and rated by real customers for consistent quality."
  },
  {
    icon: CalendarCheck,
    title: "Easy Slot Booking",
    desc: "Pick your preferred date and time — morning, afternoon, or evening — and get instant confirmation."
  },
  {
    icon: MapPin,
    title: "Real-time Tracking",
    desc: "Track your technician en route, receive live updates, and get notified when the job is complete."
  },
];

export default function FeaturesRow() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}