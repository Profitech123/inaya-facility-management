import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Choose Your Service',
    description: 'Browse our full range of professional maintenance services or pick a subscription plan that fits your property.',
    color: 'emerald',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Book & Schedule',
    description: 'Select your preferred date and time. Add extras, choose your technician, and confirm in seconds.',
    color: 'blue',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Sit Back & Relax',
    description: 'Our certified professionals arrive on time and complete the work to the highest standard.',
    color: 'amber',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-600',    ring: 'ring-emerald-100',  light: 'bg-emerald-50',  text: 'text-emerald-700',  num: 'text-emerald-300' },
  blue:    { bg: 'bg-blue-600',       ring: 'ring-blue-100',     light: 'bg-blue-50',     text: 'text-blue-700',     num: 'text-blue-300' },
  amber:   { bg: 'bg-amber-500',      ring: 'ring-amber-100',    light: 'bg-amber-50',    text: 'text-amber-700',    num: 'text-amber-300' },
};

export default function HowItWorks() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Subtle line pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(15,23,42,1) 1px, transparent 1px)',
        backgroundSize: '100% 80px'
      }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-slate-600 font-semibold text-[11px] tracking-[0.2em] uppercase">Simple Process</span>
          </div>
          <h2 className="font-display text-[2.75rem] lg:text-[3.5rem] font-bold text-slate-900 tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-slate-500 max-w-md mx-auto font-light text-[15px] leading-relaxed">
            Professional maintenance for your property in three effortless steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16 mb-20 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-[3.25rem] left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-emerald-200 via-blue-200 to-amber-200" />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const cm = colorMap[step.color];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative text-center group"
              >
                {/* Step circle */}
                <div className="flex justify-center mb-8">
                  <div className={`relative w-[4.5rem] h-[4.5rem] rounded-2xl ${cm.bg} flex items-center justify-center ring-8 ${cm.ring} shadow-luxury group-hover:-translate-y-1 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.6} />
                    {/* Step number badge */}
                    <span className={`absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white border border-slate-100 shadow text-[10px] font-bold text-slate-600 flex items-center justify-center`}>
                      {idx + 1}
                    </span>
                  </div>
                </div>

                <div className={`text-[11px] font-bold ${cm.text} tracking-[0.25em] uppercase mb-3`}>Step {step.number}</div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] mx-auto font-light">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to={createPageUrl('OnDemandServices')}>
            <button className="group inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-9 py-4 rounded-2xl text-[15px] font-semibold shadow-luxury hover:shadow-luxury-lg transition-all duration-300 hover:-translate-y-0.5">
              Get Started Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}