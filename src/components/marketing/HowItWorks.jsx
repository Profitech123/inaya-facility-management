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
    description: 'Browse our wide range of professional home maintenance services or pick a subscription package that fits your needs.',
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'border-emerald-200',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Book & Schedule',
    description: 'Select your preferred date, time slot, and property. Add any extras or choose a specific technician.',
    color: 'bg-blue-50 text-blue-600',
    accent: 'border-blue-200',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Sit Back & Relax',
    description: 'Our certified technicians arrive on time, complete the job to the highest standard, and you can track everything in real time.',
    color: 'bg-amber-50 text-amber-600',
    accent: 'border-amber-200',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-emerald-600 text-sm font-bold tracking-widest uppercase">Simple Process</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">
            How It Works
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Getting professional maintenance for your home has never been easier. Three simple steps and you're done.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-14">
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
                {/* Connector line for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-slate-200 z-0" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-2xl ${step.color} flex items-center justify-center mb-5 border-2 ${step.accent} shadow-sm`}>
                    <Icon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Step {step.number}</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
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
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 gap-2 shadow-md">
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}