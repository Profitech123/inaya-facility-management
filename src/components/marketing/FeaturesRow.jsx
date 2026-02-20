import React from 'react';
import { ShieldCheck, CalendarCheck, MapPin, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description: "Every technician is licensed, background-checked, and trained to deliver excellence.",
    stat: "100%",
    statLabel: "vetted"
  },
  {
    icon: CalendarCheck,
    title: "Effortless Scheduling",
    description: "Book any service in under 60 seconds. Choose your slot, confirm, and relax.",
    stat: "60s",
    statLabel: "to book"
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Follow your technician in real time. Know exactly when they arrive.",
    stat: "Real-time",
    statLabel: "updates"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock assistance for emergencies. We are always just a call away.",
    stat: "24/7",
    statLabel: "available"
  },
];

export default function FeaturesRow() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg"
                style={{ borderColor: 'hsl(40,10%,92%)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300" style={{ backgroundColor: 'hsl(160,60%,38%)', color: 'white' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'hsl(210,20%,10%)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'hsl(210,10%,46%)' }}>{feature.description}</p>
                <div className="pt-4 border-t" style={{ borderColor: 'hsl(40,10%,92%)' }}>
                  <span className="text-2xl font-bold" style={{ color: 'hsl(160,60%,38%)' }}>{feature.stat}</span>
                  <span className="text-xs uppercase tracking-wider ml-2" style={{ color: 'hsl(210,10%,46%)' }}>{feature.statLabel}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
