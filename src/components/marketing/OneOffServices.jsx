import React from 'react';
import { Snowflake, Zap, Droplets, Hammer, HardHat, Bug, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const services = [
  { icon: Snowflake, label: "AC Repair", desc: "Cooling & ventilation" },
  { icon: Zap, label: "Electrical", desc: "Wiring & fixtures" },
  { icon: Droplets, label: "Plumbing", desc: "Pipes & drainage" },
  { icon: Hammer, label: "Handyman", desc: "General repairs" },
  { icon: HardHat, label: "Civil Works", desc: "Renovation & paint" },
  { icon: Bug, label: "Pest Control", desc: "Treatment & prevention" },
];

export default function OneOffServices() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
                On Demand
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold"
              style={{ color: 'hsl(210,20%,10%)', fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Quick fix?{' '}
              <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>Book instantly.</span>
            </motion.h2>
          </div>
          <Link to={createPageUrl('OnDemandServices')} className="flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: 'hsl(160,60%,38%)' }}>
            View all services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={createPageUrl('OnDemandServices')}
                  className="block p-6 rounded-2xl text-center transition-all duration-300 border group hover:shadow-lg hover:-translate-y-1"
                  style={{ borderColor: 'hsl(40,10%,92%)' }}
                >
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center transition-colors duration-300 group-hover:scale-110" style={{ backgroundColor: 'hsl(160,60%,95%)', color: 'hsl(160,60%,38%)' }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm mb-1" style={{ color: 'hsl(210,20%,10%)' }}>{service.label}</h4>
                  <p className="text-xs" style={{ color: 'hsl(210,10%,46%)' }}>{service.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
