import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const highlights = [
  { icon: Building2, label: "549+ Hectares", desc: "Under Management" },
  { icon: MapPin, label: "UAE Wide", desc: "Coverage" },
  { icon: Users, label: "700+", desc: "Professionals" },
];

export default function ManagingPortfolios() {
  return (
    <div className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-4">
              Why Choose INAYA
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Managing Portfolios to Enhance{' '}
              <span className="text-emerald-600">Building Performance</span>
            </h2>
            <p className="text-lg text-slate-600 mb-4 leading-relaxed">
              At INAYA, we are passionate about the services we provide, and committed to delivering them in a responsible, efficient and environmentally-sound manner.
            </p>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed">
              We not only maintain your property to exemplary standards, but proactively look for ways to improve its lifecycle, performance and cost-efficiency.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80">
                    <Icon className="w-5 h-5 text-emerald-600 mb-2" />
                    <div className="text-xl font-bold text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                );
              })}
            </div>

            <Link to={createPageUrl('IntegratedFM')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 px-7 text-base shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5">
                Discover Our Services <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-12 grid-rows-12 gap-3 h-[520px]">
              <div className="col-span-7 row-span-8 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"
                  alt="Modern building"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-5 row-span-6 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&q=80"
                  alt="Office building"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-5 row-span-6 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80"
                  alt="Residential tower"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-7 row-span-4 rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=600&q=80"
                  alt="Pool maintenance"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-emerald-600 text-white rounded-2xl px-6 py-4 shadow-xl">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-emerald-100 text-sm">Service & Support</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}