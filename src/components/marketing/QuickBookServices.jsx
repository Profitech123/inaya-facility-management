import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Zap, Wrench, Hammer, HardHat, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const quickServices = [
  { icon: Wind, label: "AC Repair", color: "bg-sky-50 text-sky-600", hover: "hover:border-sky-300" },
  { icon: Zap, label: "Electrical", color: "bg-amber-50 text-amber-600", hover: "hover:border-amber-300" },
  { icon: Wrench, label: "Plumbing", color: "bg-blue-50 text-blue-600", hover: "hover:border-blue-300" },
  { icon: Hammer, label: "Handyman", color: "bg-purple-50 text-purple-600", hover: "hover:border-purple-300" },
  { icon: HardHat, label: "Civil Works", color: "bg-emerald-50 text-emerald-600", hover: "hover:border-emerald-300" },
  { icon: Bug, label: "Pest Control", color: "bg-red-50 text-red-600", hover: "hover:border-red-300" },
];

export default function QuickBookServices() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-emerald-600 text-sm font-bold tracking-[0.15em] uppercase">Quick Book</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">One-Off Services</h2>
          <p className="text-slate-500 mt-3">Need something fixed today? Book a one-time service instantly.</p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {quickServices.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link
                  to={createPageUrl('OnDemandServices')}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 bg-white ${svc.hover} hover:shadow-md transition-all duration-300 group`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${svc.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{svc.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}