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
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    icon: Wrench,
    title: "MEP Services",
    desc: "Expert mechanical, electrical, and plumbing maintenance to keep every system running smoothly.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/d03d43a2b_generated_image.png",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: HardHat,
    title: "Civil Works",
    desc: "From minor repairs to full renovations — painting, waterproofing, tiling, and structural fixes.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/79b70ebb8_generated_image.png",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function SpecializedServices() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-600 text-sm font-bold tracking-[0.15em] uppercase">Specialized Services</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">Expert Solutions for Every Need</h2>
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
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="h-52 overflow-hidden">
                  <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${svc.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${svc.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{svc.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{svc.desc}</p>
                  <Link to={createPageUrl('OnDemandServices')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 group/link">
                    Learn more <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
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