import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="relative py-36 overflow-hidden bg-[#0B150F]">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        {/* Deep green atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-700/20 rounded-full blur-[160px] -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-teal-800/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/20 rounded-full blur-[120px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_50%,rgba(0,0,0,0.6))]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold text-[11px] uppercase tracking-[0.25em]">Get Started Today</span>
          </div>

          <h2 className="font-display text-[3rem] md:text-[4rem] lg:text-[5rem] font-bold text-white mb-7 leading-tighter tracking-tightest">
            Ready for a<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300">
              Maintenance-Free Life?
            </span>
          </h2>

          <p className="text-white/45 text-lg mb-14 max-w-xl mx-auto leading-relaxed font-light">
            Book your first service in minutes, subscribe to a plan, or speak to us about your property's unique needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('OnDemandServices')}>
              <button className="group flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 px-10 py-4 rounded-2xl text-[15px] font-bold shadow-[0_20px_60px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_24px_70px_-8px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto">
                Book Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="tel:60546292" className="w-full sm:w-auto">
              <button className="group flex items-center justify-center gap-3 bg-white/8 hover:bg-white/12 backdrop-blur-sm text-white border border-white/15 hover:border-white/25 px-10 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 w-full">
                <Phone className="w-4 h-4" />
                Call 800-INAYA
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}