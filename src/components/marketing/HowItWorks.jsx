import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  { number: '01', icon: Search,        title: 'Choose Your Service', description: 'Browse our full range of professional maintenance services or pick a subscription plan that fits your property.', color: 'emerald' },
  { number: '02', icon: CalendarCheck, title: 'Book & Schedule',      description: 'Select your preferred date and time. Add extras, choose your technician, and confirm in seconds.',             color: 'blue' },
  { number: '03', icon: Sparkles,      title: 'Sit Back & Relax',     description: 'Our certified professionals arrive on time and complete the work to the highest standard.',                        color: 'amber' },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-600', ring: 'ring-emerald-100', light: 'bg-emerald-50', text: 'text-emerald-700', line: 'from-emerald-300' },
  blue:    { bg: 'bg-blue-600',    ring: 'ring-blue-100',    light: 'bg-blue-50',    text: 'text-blue-700',    line: 'to-blue-300' },
  amber:   { bg: 'bg-amber-500',   ring: 'ring-amber-100',   light: 'bg-amber-50',   text: 'text-amber-700',   line: 'to-amber-300' },
};

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.6], ['0%', '100%']);

  return (
    <section ref={sectionRef} className="py-32 bg-white relative overflow-hidden">
      {/* Subtle line pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(15,23,42,1) 1px, transparent 1px)',
        backgroundSize: '100% 80px'
      }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-slate-600 font-semibold text-[11px] tracking-[0.2em] uppercase">Simple Process</span>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[2.75rem] lg:text-[3.5rem] font-bold text-slate-900 tracking-tight mb-4"
            >
              How It Works
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 max-w-md mx-auto font-light text-[15px] leading-relaxed"
          >
            Professional maintenance for your property in three effortless steps.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16 mb-20 relative">
          {/* Animated scroll connector */}
          <div className="hidden md:block absolute top-[3.25rem] left-[20%] right-[20%] h-px bg-slate-100 overflow-hidden">
            <motion.div
              style={{ width: lineWidth }}
              className="h-full bg-gradient-to-r from-emerald-300 via-blue-300 to-amber-300"
            />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const cm = colorMap[step.color];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: idx * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative text-center group"
              >
                {/* Step circle */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    whileHover={{ y: -6, scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                    className={`relative w-[4.5rem] h-[4.5rem] rounded-2xl ${cm.bg} flex items-center justify-center ring-8 ${cm.ring} shadow-luxury`}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.6} />
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 400, damping: 16, delay: idx * 0.18 + 0.3 }}
                      className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border border-slate-100 shadow text-[10px] font-bold text-slate-600 flex items-center justify-center"
                    >
                      {idx + 1}
                    </motion.span>
                  </motion.div>
                </div>

                <div className={`text-[11px] font-bold ${cm.text} tracking-[0.25em] uppercase mb-3`}>Step {step.number}</div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] mx-auto font-light">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <Link to={createPageUrl('OnDemandServices')}>
            <motion.button
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="group inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-9 py-4 rounded-2xl text-[15px] font-semibold shadow-luxury hover:shadow-luxury-lg transition-colors duration-200"
            >
              Get Started Now
              <motion.span
                className="inline-flex"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}