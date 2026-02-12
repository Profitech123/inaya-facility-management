import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award, Zap, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative min-h-[92vh] flex items-center bg-slate-950 text-white overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80"
          alt="Dubai skyline"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04]">
        <div className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full border border-white" />
        <div className="absolute top-40 right-40 w-[400px] h-[400px] rounded-full border border-white" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium tracking-wide">A Member of Belhasa Group</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl lg:text-7xl font-bold mb-7 leading-[1.08] tracking-tight"
          >
            Flexible, Cost Competitive
            <span className="block mt-2 bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Solutions, Tailored to Your Needs
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg lg:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl"
          >
            INAYA develops, manages and executes FM strategies to maximise the performance and lifecycle of your property. From residential and commercial through to large-scale retail properties, we offer maintenance, cleaning and specialist services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link to={createPageUrl('Services')}>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white text-base px-8 h-14 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-400/30 hover:-translate-y-0.5">
                Book a Service
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Subscriptions')}>
              <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/10 border-white/20 text-white text-base px-8 h-14 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                View Packages
              </Button>
            </Link>
          </motion.div>

          {/* Service Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: Zap, label: "Integrated FM", link: "IntegratedFM", desc: "Full spectrum" },
              { icon: Shield, label: "Hard Services", link: "HardServices", desc: "MEP & Technical" },
              { icon: Award, label: "Soft Services", link: "SoftServices", desc: "Cleaning & More" },
              { icon: Clock, label: "24/7 Support", link: "Contact", desc: "Always available" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={createPageUrl(item.link)}
                  className="group bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-sm border border-white/[0.08] hover:border-emerald-400/30 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-2.5 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-semibold mb-0.5">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-white/30 animate-bounce" />
      </motion.div>
    </div>
  );
}