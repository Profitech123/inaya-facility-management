import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Wrench, HardHat, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const services = [
  {
    icon: Wind,
    title: "AC Maintenance",
    desc: "Complete AC servicing, deep cleaning, gas top-up, and 24/7 emergency repair for all unit types.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/ddbdf002d_generated_image.png",
    gradient: "from-sky-500 to-cyan-500",
    shadow: "shadow-sky-500/20",
  },
  {
    icon: Wrench,
    title: "MEP Services",
    desc: "Expert mechanical, electrical, and plumbing maintenance to keep every system running smoothly.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/d03d43a2b_generated_image.png",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    icon: HardHat,
    title: "Civil Works",
    desc: "From minor repairs to full renovations — painting, waterproofing, tiling, and structural fixes.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/79b70ebb8_generated_image.png",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
];

export default function SpecializedServices() {
  return (
    <section className="py-28 bg-slate-50/50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2 mb-5 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Specialized</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Expert Solutions for Every Need</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-xl ${svc.shadow}`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">{svc.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{svc.desc}</p>
                  <Link to={createPageUrl('OnDemandServices')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5 group/link">
                    Learn more <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
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