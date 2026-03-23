import React from 'react';
import { Award, Shield, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { icon: Users, value: "700+",  label: "Expert Team Members", color: "emerald" },
  { icon: Clock, value: "24/7",  label: "Service & Maintenance", color: "blue" },
  { icon: Award, value: "ISO",   label: "Certified Standards",   color: "amber" },
  { icon: Shield, value: "549+", label: "Hectares Managed",      color: "purple" },
];

const certifications = [
  { name: "ISO 9001:2015", desc: "Quality Management" },
  { name: "ISO 14001:2015", desc: "Environmental Mgmt" },
  { name: "ISO 45001:2018", desc: "OH&S Management" },
  { name: "EFQM", desc: "Business Excellence" },
];

const colorMap = {
  emerald: 'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20',
  blue:    'text-blue-400    bg-blue-400/10    ring-blue-400/20',
  amber:   'text-amber-400   bg-amber-400/10   ring-amber-400/20',
  purple:  'text-purple-400  bg-purple-400/10  ring-purple-400/20',
};

export default function TrustSignals() {
  return (
    <section className="py-32 bg-[#0B0F0E] text-white relative overflow-hidden">
      {/* Deep atmospheric blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[900px] h-[900px] bg-emerald-900/20 rounded-full blur-[250px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-900/15 rounded-full blur-[200px] translate-x-1/3 translate-y-1/3" />
      </div>
      {/* Fine dot texture */}
      <div className="absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
        backgroundSize: '36px 36px'
      }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <Award className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-[11px] tracking-[0.2em] uppercase">Trusted Excellence</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-display text-[2.75rem] lg:text-[3.5rem] font-bold leading-tighter tracking-tight max-w-lg">
              A Member of<br />Belhasa Group
            </h2>
            <p className="text-white/40 max-w-sm leading-relaxed font-light text-[15px]">
              One of the UAE's most established group of companies, with both the resources and solid financial base to offer leading expertise.
            </p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const cm = colorMap[stat.color];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.07] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.04] to-transparent rounded-bl-full" />

                <div className={`w-12 h-12 rounded-xl ${cm} ring-1 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${cm.split(' ')[0]}`} strokeWidth={1.8} />
                </div>
                <div className="text-[2.5rem] font-extrabold mb-1 tracking-tight leading-none">{stat.value}</div>
                <div className="text-white/40 text-[12px] font-medium">{stat.label}</div>
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
              className="bg-white/[0.025] border border-white/[0.05] rounded-xl px-6 py-5 flex items-center gap-4 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="w-1 h-8 rounded-full bg-emerald-500/50 flex-shrink-0" />
              <div>
                <div className="text-sm font-extrabold text-emerald-400">{cert.name}</div>
                <div className="text-[11px] text-white/35 mt-0.5">{cert.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}