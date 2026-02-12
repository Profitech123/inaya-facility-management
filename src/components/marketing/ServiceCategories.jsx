import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Wrench, Settings, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const categories = [
  {
    icon: Sparkles,
    title: "Soft Services",
    description: "Cleaning, pest control, landscaping, pool maintenance, waste management, and security services.",
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    iconColor: "text-blue-600",
    services: ["Cleaning Services", "Pest Control", "Landscaping & Irrigation", "Pool Maintenance", "Security Services", "Waste Management"]
  },
  {
    icon: Wrench,
    title: "Hard Services",
    description: "MEP maintenance, AC servicing, plumbing, electrical work, and civil maintenance.",
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50",
    iconColor: "text-amber-600",
    services: ["AC Maintenance", "Plumbing Repairs", "Electrical Services", "Civil Maintenance", "24/7 Emergency Response"]
  },
  {
    icon: Settings,
    title: "Specialized Services",
    description: "Expert solutions for firefighting systems, elevators, water treatment, and more.",
    gradient: "from-purple-500 to-purple-600",
    lightBg: "bg-purple-50",
    iconColor: "text-purple-600",
    services: ["Firefighting Systems", "Elevator Maintenance", "Water Tank Cleaning", "Signage & Digital Systems"]
  }
];

export default function ServiceCategories() {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-4"
          >
            What We Offer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 mb-5"
          >
            Complete Home Care Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto"
          >
            Everything your villa or apartment needs, available on-demand or through our subscription packages.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group relative bg-white border border-slate-200/80 rounded-3xl p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl ${category.lightBg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${category.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{category.title}</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">{category.description}</p>
                <ul className="space-y-2.5 mb-8">
                  {category.services.map((service, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 mr-2.5 flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('Services')}>
                  <Button variant="ghost" className="w-full group/btn hover:bg-slate-50 font-semibold">
                    View Services
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}