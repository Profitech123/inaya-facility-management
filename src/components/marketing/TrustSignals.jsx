import React from 'react';
import { Award, Shield, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { icon: Users, value: "700+", label: "Expert Team Members", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Clock, value: "24/7", label: "Service & Maintenance", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Award, value: "ISO", label: "Certified Standards", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Shield, value: "549+", label: "Hectares Managed", color: "text-purple-600", bg: "bg-purple-50" }
];

const certifications = [
  { name: "ISO 9001:2015", desc: "Quality Management" },
  { name: "ISO 14001:2015", desc: "Environmental" },
  { name: "ISO 45001:2018", desc: "OH&S Management" },
  { name: "EFQM", desc: "Business Excellence" }
];

export default function TrustSignals() {
  return (
    <div className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[200px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-4"
          >
            Trusted Excellence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-5"
          >
            A Member of Belhasa Group
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            One of the UAE's most established group of companies, with both the resources and solid financial base to offer leading expertise.
          </motion.p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 text-center hover:bg-white/[0.1] transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {certifications.map((cert, idx) => (
            <div
              key={idx}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-center hover:bg-white/[0.08] transition-all"
            >
              <div className="text-base font-bold text-emerald-400 mb-1">{cert.name}</div>
              <div className="text-xs text-slate-500">{cert.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}