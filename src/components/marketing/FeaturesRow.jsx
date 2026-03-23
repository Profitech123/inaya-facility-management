import React from 'react';
import { ShieldCheck, CalendarCheck, MapPin, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: ShieldCheck,
    title: "Certified Technicians",
    desc: "Every professional is vetted, background-checked, and certified to the highest industry standards.",
    accent: "emerald",
  },
  {
    icon: CalendarCheck,
    title: "Instant Scheduling",
    desc: "Pick your preferred date and time slot. Get instant confirmation with smart calendar management.",
    accent: "blue",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    desc: "Track your technician in real-time, receive live updates, and get notified at every stage.",
    accent: "violet",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Round-the-clock customer service for emergencies and enquiries. We're always here for you.",
    accent: "amber",
  },
];

const accentMap = {
  emerald: { dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600', num: 'text-emerald-200' },
  blue:    { dot: 'bg-blue-500',    bar: 'bg-blue-500',    text: 'text-blue-600',    num: 'text-blue-200' },
  violet:  { dot: 'bg-violet-500',  bar: 'bg-violet-500',  text: 'text-violet-600',  num: 'text-violet-200' },
  amber:   { dot: 'bg-amber-500',   bar: 'bg-amber-500',   text: 'text-amber-600',   num: 'text-amber-200' },
};

export default function FeaturesRow() {
  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {features.map((f, idx) => {
            const Icon = f.icon;
            const ac = accentMap[f.accent];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative px-8 py-10 hover:bg-slate-50/60 transition-colors duration-300 first:pl-0 last:pr-0"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-8 w-8 h-[2px] ${ac.bar} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className={`w-11 h-11 rounded-xl border border-slate-100 bg-white flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                  <Icon className={`w-5 h-5 ${ac.text}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}