import React from 'react';
import { ShieldCheck, CalendarCheck, MapPin, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: ShieldCheck, title: "Certified Technicians",  desc: "Every professional is vetted, background-checked, and certified to the highest industry standards.", accent: "emerald" },
  { icon: CalendarCheck, title: "Instant Scheduling",  desc: "Pick your preferred date and time slot. Get instant confirmation with smart calendar management.",   accent: "blue" },
  { icon: MapPin,       title: "Live Tracking",         desc: "Track your technician in real-time, receive live updates, and get notified at every stage.",          accent: "violet" },
  { icon: Headphones,   title: "24/7 Support",          desc: "Round-the-clock customer service for emergencies and enquiries. We're always here for you.",          accent: "amber" },
];

const accentMap = {
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600', glow: 'shadow-emerald-100', bg: 'bg-emerald-50' },
  blue:    { bar: 'bg-blue-500',    text: 'text-blue-600',    glow: 'shadow-blue-100',    bg: 'bg-blue-50' },
  violet:  { bar: 'bg-violet-500',  text: 'text-violet-600',  glow: 'shadow-violet-100',  bg: 'bg-violet-50' },
  amber:   { bar: 'bg-amber-500',   text: 'text-amber-600',   glow: 'shadow-amber-100',   bg: 'bg-amber-50' },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};

export default function FeaturesRow() {
  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
        >
          {features.map((f, idx) => {
            const Icon = f.icon;
            const ac = accentMap[f.accent];
            return (
              <motion.div
                key={idx}
                variants={item}
                whileHover={{ backgroundColor: 'rgba(248,250,252,0.8)', transition: { duration: 0.2 } }}
                className="group relative px-8 py-10 transition-colors duration-300 first:pl-0 last:pr-0 cursor-default"
              >
                {/* Animated top accent bar */}
                <motion.div
                  className={`absolute top-0 left-8 h-[2px] ${ac.bar} rounded-full`}
                  initial={{ width: 0 }}
                  whileInView={{ width: 32 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 + 0.4, ease: 'easeOut' }}
                />

                <motion.div
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className={`w-11 h-11 rounded-xl border border-slate-100 ${ac.bg} flex items-center justify-center mb-6 shadow-sm`}
                >
                  <Icon className={`w-5 h-5 ${ac.text}`} strokeWidth={1.8} />
                </motion.div>

                <h3 className="text-[15px] font-bold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}