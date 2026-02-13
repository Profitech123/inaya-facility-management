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
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    borderHover: "hover:border-sky-200",
    services: ["Cleaning Services", "Pest Control", "Landscaping & Irrigation", "Pool Maintenance", "Security Services", "Waste Management"]
  },
  {
    icon: Wrench,
    title: "Hard Services",
    description: "MEP maintenance, AC servicing, plumbing, electrical work, and civil maintenance.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    borderHover: "hover:border-amber-200",
    services: ["AC Maintenance", "Plumbing Repairs", "Electrical Services", "Civil Maintenance", "24/7 Emergency Response"]
  },
  {
    icon: Settings,
    title: "Specialized Services",
    description: "Expert solutions for firefighting systems, elevators, water treatment, and more.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-200",
    services: ["Firefighting Systems", "Elevator Maintenance", "Water Tank Cleaning", "Signage & Digital Systems"]
  }
];

export default function ServiceCategories() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-600 font-semibold text-xs uppercase tracking-widest mb-3"
          >
            What We Offer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 text-balance"
          >
            Complete Home Care Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Everything your villa or apartment needs, available on-demand or through our subscription packages.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-xl transition-all duration-300 ${category.borderHover}`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.iconBg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${category.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{category.title}</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">{category.description}</p>
                <ul className="space-y-2 mb-6">
                  {category.services.map((service, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mr-2 flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('OnDemandServices')}>
                  <Button variant="ghost" size="sm" className="w-full text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium">
                    View Services
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
