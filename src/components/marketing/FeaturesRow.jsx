import React from 'react';
import { ShieldCheck, CalendarCheck, MapPin, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: ShieldCheck,
    title: "Certified Technicians",
    desc: "Every professional is vetted, background-checked, and certified to the highest industry standards.",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: CalendarCheck,
    title: "Instant Scheduling",
    desc: "Pick your preferred date and time slot. Get instant confirmation with smart calendar management.",
    gradient: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/20",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    desc: "Track your technician in real-time, receive live updates, and get notified at every stage.",
    gradient: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Round-the-clock customer service for emergencies and enquiries. We're always here for you.",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
];

export default function FeaturesRow() {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="relative bg-white border border-slate-100 rounded-2xl p-7 hover:border-slate-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}