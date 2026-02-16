import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Zap, Wrench, Hammer, HardHat, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const quickServices = [
  { icon: Wind, label: "AC Repair", gradient: "from-sky-500 to-cyan-500", shadow: "shadow-sky-500/20", bg: "bg-sky-50" },
  { icon: Zap, label: "Electrical", gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20", bg: "bg-amber-50" },
  { icon: Wrench, label: "Plumbing", gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20", bg: "bg-blue-50" },
  { icon: Hammer, label: "Handyman", gradient: "from-purple-500 to-violet-500", shadow: "shadow-purple-500/20", bg: "bg-purple-50" },
  { icon: HardHat, label: "Civil Works", gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20", bg: "bg-emerald-50" },
  { icon: Bug, label: "Pest Control", gradient: "from-red-500 to-rose-500", shadow: "shadow-red-500/20", bg: "bg-red-50" },
];

export default function QuickBookServices() {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-2 mb-5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Quick Book</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">One-Off Services</h2>
          <p className="text-slate-400 mt-3 text-lg font-light">Need something fixed today? Book a one-time service instantly.</p>
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
                  className="flex flex-col items-center gap-3.5 p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-lg ${svc.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{svc.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}