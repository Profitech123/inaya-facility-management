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
    lightBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    borderHover: "hover:border-blue-200",
    services: ["Cleaning Services", "Pest Control", "Landscaping & Irrigation", "Pool Maintenance", "Security Services", "Waste Management"]
  },
  {
    icon: Wrench,
    title: "Hard Services",
    description: "MEP maintenance, AC servicing, plumbing, electrical work, and civil maintenance.",
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    borderHover: "hover:border-amber-200",
    services: ["AC Maintenance", "Plumbing Repairs", "Electrical Services", "Civil Maintenance", "24/7 Emergency Response"]
  },
  {
    icon: Settings,
    title: "Specialized Services",
    description: "Expert solutions for firefighting systems, elevators, water treatment, and more.",
    gradient: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
    borderHover: "hover:border-purple-200",
    services: ["Firefighting Systems", "Elevator Maintenance", "Water Tank Cleaning", "Signage & Digital Systems"]
  }
];

export default function ServiceCategories() {
  return (
    <div className="py-28 bg-white relative overflow-hidden">
      {/* Premium background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-50/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-50/40 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2 mb-5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-semibold text-xs uppercase tracking-widest">Our Services</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight"
          >
            Complete Home Care Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-light"
          >
            Everything your villa or apartment needs — available on-demand or through our subscription packages.
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
                transition={{ delay: idx * 0.12 }}
                className={`group relative bg-white border border-slate-100 rounded-3xl p-8 lg:p-9 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 ${category.borderHover}`}
              >
                {/* Gradient accent top */}
                <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className={`w-16 h-16 rounded-2xl ${category.lightBg} flex items-center justify-center mb-7 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${category.iconColor}`} strokeWidth={1.6} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">{category.title}</h3>
                <p className="text-slate-400 mb-7 leading-relaxed text-[15px]">{category.description}</p>
                <ul className="space-y-3 mb-8">
                  {category.services.map((service, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center mr-3 flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                      </div>
                      {service}
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('OnDemandServices')}>
                  <Button variant="ghost" className="w-full group/btn hover:bg-slate-50 font-semibold h-12 rounded-xl text-slate-700">
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