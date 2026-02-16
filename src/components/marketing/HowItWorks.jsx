import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Search, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Choose Your Service',
    description: 'Browse our wide range of professional maintenance services or pick a subscription that fits.',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/25',
    bg: 'bg-emerald-50',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Book & Schedule',
    description: 'Select your preferred date, time slot, and property. Add extras or choose your technician.',
    gradient: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/25',
    bg: 'bg-blue-50',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Sit Back & Relax',
    description: 'Our certified technicians arrive on time and complete the job to the highest standard.',
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/25',
    bg: 'bg-amber-50',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Simple Process</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto text-lg font-light">
            Professional maintenance for your home in three easy steps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-emerald-200 via-blue-200 to-amber-200" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-[4.5rem] h-[4.5rem] rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-xl ${step.shadow} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={1.6} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-3">Step {step.number}</div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
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
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-14 gap-2.5 shadow-2xl shadow-slate-900/20 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5">
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}