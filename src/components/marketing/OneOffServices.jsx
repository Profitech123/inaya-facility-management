import React from 'react';
import { Snowflake, Zap, Droplets, Hammer, HardHat, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const services = [
  { icon: Snowflake, label: "AC Repair" },
  { icon: Zap, label: "Electrical" },
  { icon: Droplets, label: "Plumbing" },
  { icon: Hammer, label: "Handyman" },
  { icon: HardHat, label: "Civil Works" },
  { icon: Bug, label: "Pest Control" },
];

export default function OneOffServices() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-slate-900"
          >
            One-off Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-slate-500"
          >
            Just need a quick fix? Book a single service instantly.
          </motion.p>
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
                  className="block bg-white p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-emerald-500"
                >
                  <div className="text-emerald-500 mb-4 flex justify-center">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{service.label}</h4>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
