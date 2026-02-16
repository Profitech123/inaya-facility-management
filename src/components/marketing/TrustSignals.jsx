import React from 'react';
import { Award, Shield, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { icon: Users, value: "700+", label: "Expert Team Members", gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20" },
  { icon: Clock, value: "24/7", label: "Service & Maintenance", gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20" },
  { icon: Award, value: "ISO", label: "Certified Standards", gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
  { icon: Shield, value: "549+", label: "Hectares Managed", gradient: "from-purple-500 to-violet-500", shadow: "shadow-purple-500/20" },
];

const certifications = [
  { name: "ISO 9001:2015", desc: "Quality Management" },
  { name: "ISO 14001:2015", desc: "Environmental" },
  { name: "ISO 45001:2018", desc: "OH&S Management" },
  { name: "EFQM", desc: "Business Excellence" },
];

export default function TrustSignals() {
  return (
    <div className="py-28 bg-slate-950 text-white relative overflow-hidden">
      {/* Premium dark gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[180px] translate-x-1/3 translate-y-1/3" />
      </div>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-5"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-xs uppercase tracking-widest">Trusted Excellence</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight"
          >
            A Member of Belhasa Group
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-light"
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
                className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 text-center hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-5 shadow-xl ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                </div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight">{stat.value}</div>
                <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
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
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="text-base font-extrabold text-emerald-400 mb-1">{cert.name}</div>
              <div className="text-xs text-slate-500">{cert.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}