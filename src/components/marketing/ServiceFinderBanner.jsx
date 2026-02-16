import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, ArrowRight, Banknote, Package } from 'lucide-react';

export default function ServiceFinderBanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Premium dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[120px] translate-y-1/3 translate-x-1/4" />
      </div>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 backdrop-blur-sm rounded-full px-5 py-2 mb-7">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">AI-Powered</span>
            </div>
            <h2 className="text-3xl lg:text-[2.75rem] font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
              Not Sure What You Need?
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Let AI Find It For You</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed font-light">
              Describe your issue in plain words — "my AC is leaking", "villa needs deep clean" — and our AI instantly matches you with the right services and estimated costs.
            </p>
            <Link to={createPageUrl('ServiceFinder')}>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-base px-10 h-14 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.15)] gap-2.5 font-bold transition-all hover:-translate-y-1 rounded-xl">
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
                <div key={idx} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}