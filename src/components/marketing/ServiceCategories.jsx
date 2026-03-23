import React, { useState } from 'react';
import { Sparkles, Wrench, Settings, ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const categories = [
  {
    icon: Sparkles,
    eyebrow: "01 — Soft Services",
    title: "Cleaning & Grounds",
    description: "Comprehensive soft services covering cleaning, pest control, landscaping, pool care, waste management, and security — keeping your property pristine.",
    accent: "from-blue-500 to-blue-600",
    accentLight: "blue",
    services: ["Cleaning Services", "Pest Control", "Landscaping & Irrigation", "Pool Maintenance", "Security Services", "Waste Management"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
  },
  {
    icon: Wrench,
    eyebrow: "02 — Hard Services",
    title: "MEP & Civil",
    description: "Expert mechanical, electrical, and plumbing maintenance alongside AC servicing, civil works, and 24/7 emergency response.",
    accent: "from-amber-500 to-orange-500",
    accentLight: "amber",
    services: ["AC Maintenance", "Plumbing Repairs", "Electrical Services", "Civil Maintenance", "24/7 Emergency Response"],
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop"
  },
  {
    icon: Settings,
    eyebrow: "03 — Specialized",
    title: "Technical Systems",
    description: "Specialist care for complex building systems — firefighting, elevators, water treatment, signage, and digital infrastructure.",
    accent: "from-purple-500 to-violet-600",
    accentLight: "purple",
    services: ["Firefighting Systems", "Elevator Maintenance", "Water Tank Cleaning", "Signage & Digital Systems"],
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop"
  }
];

const lightMap = {
  blue: { check: 'text-blue-600', bullet: 'bg-blue-100', eyebrow: 'text-blue-600' },
  amber: { check: 'text-amber-600', bullet: 'bg-amber-100', eyebrow: 'text-amber-600' },
  purple: { check: 'text-purple-600', bullet: 'bg-purple-100', eyebrow: 'text-purple-600' },
};

export default function ServiceCategories() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="py-32 bg-[#F8F7F4] relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.8) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2.5 border border-slate-200 bg-white rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-semibold text-[11px] tracking-[0.2em] uppercase">Our Services</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-display text-[2.75rem] lg:text-[3.5rem] font-bold text-slate-900 leading-tighter tracking-tight max-w-lg">
              Complete Home<br />Care Solutions
            </h2>
            <p className="text-slate-500 max-w-sm leading-relaxed font-light text-[15px]">
              Everything your villa or apartment needs — available on-demand or through our subscription packages.
            </p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-7">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const lm = lightMap[cat.accentLight];
            const isHovered = hovered === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onHoverStart={() => setHovered(idx)}
                onHoverEnd={() => setHovered(null)}
                className="group relative bg-white rounded-[1.75rem] overflow-hidden border border-slate-100 hover:border-transparent hover:shadow-luxury-xl transition-all duration-500 cursor-default flex flex-col"
              >
                {/* Image header */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
                  <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
                    <span className={`text-[10px] font-bold tracking-[0.2em] uppercase text-white/80`}>{cat.eyebrow}</span>
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="font-display text-[1.5rem] font-bold text-slate-900 mb-3 tracking-tight">{cat.title}</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed mb-6 font-light">{cat.description}</p>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {cat.services.map((svc, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[13px] text-slate-700 font-medium">
                        <div className={`w-5 h-5 rounded-full ${lm.bullet} flex items-center justify-center flex-shrink-0`}>
                          <Check className={`w-3 h-3 ${lm.check}`} strokeWidth={3} />
                        </div>
                        {svc}
                      </li>
                    ))}
                  </ul>

                  <Link to={createPageUrl('OnDemandServices')}>
                    <button className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 group/btn">
                      <span className="text-[13px] font-semibold text-slate-800">View Services</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover/btn:text-slate-800 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}