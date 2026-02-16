import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, ArrowRight, Clock, Banknote, Package } from 'lucide-react';

export default function ServiceFinderBanner() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full border border-white -translate-y-1/2 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full border border-white translate-y-1/3 translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span className="text-sm font-medium text-emerald-100">AI-Powered</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Not Sure What You Need?<br />
              <span className="text-emerald-200">Let AI Find It For You</span>
            </h2>
            <p className="text-lg text-emerald-100/90 mb-8 max-w-xl leading-relaxed">
              Describe your issue in plain words — "my AC is leaking", "villa needs deep clean" — and our AI instantly matches you with the right services, estimated costs, and best packages.
            </p>
            <Link to={createPageUrl('ServiceFinder')}>
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8 h-14 shadow-xl shadow-black/10 gap-2 font-semibold transition-all hover:-translate-y-0.5">
                <Search className="w-5 h-5" /> Try Service Finder
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Search, title: "Smart Search", desc: "Describe any issue in your own words" },
              { icon: Sparkles, title: "AI Matching", desc: "Instantly matched to the right services" },
              { icon: Banknote, title: "Cost Estimates", desc: "See typical prices before you book" },
              { icon: Package, title: "Package Deals", desc: "Save with subscription recommendations" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
                  <Icon className="w-7 h-7 text-emerald-200 mb-3" />
                  <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-emerald-100/80">{item.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}