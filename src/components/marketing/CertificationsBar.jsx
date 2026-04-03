import React from 'react';
import { Shield, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CERTS = [
  { code: 'ISO 9001', label: 'Quality Management', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { code: 'ISO 14001', label: 'Environmental Management', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { code: 'ISO 45001', label: 'Occupational Health & Safety', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { code: 'OSHAD', label: 'Abu Dhabi OHS Framework', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { code: 'Belhasa Group', label: 'Member Company', color: 'bg-slate-50 border-slate-200 text-slate-700' },
];

export default function CertificationsBar({ dark = false }) {
  return (
    <div className={`py-12 ${dark ? 'bg-slate-900' : 'bg-white border-t border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className={`text-[11px] font-bold tracking-[0.25em] uppercase ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
            Certified &amp; Compliant
          </p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {CERTS.map((cert, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 ${dark ? 'bg-white/5 border-white/10 text-white' : cert.color}`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <div className="text-[13px] font-bold leading-none">{cert.code}</div>
                <div className={`text-[11px] mt-0.5 ${dark ? 'text-slate-400' : 'opacity-70'}`}>{cert.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}