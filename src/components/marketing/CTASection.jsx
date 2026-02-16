import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <div className="relative py-32 overflow-hidden">
      {/* Sophisticated gradient background */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-600/15 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[120px] translate-y-1/3 translate-x-1/4" />
      </div>
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold text-xs uppercase tracking-widest">Get Started Today</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-7 leading-[1.1] tracking-tight">
            Ready for a
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Maintenance-Free Life?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Book your first service in minutes, subscribe to a plan, or call us to discuss your property's unique needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl('OnDemandServices')}>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-base px-10 h-14 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 font-bold gap-2.5 rounded-xl">
                Book Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:600546292">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-10 h-14 backdrop-blur-sm transition-all hover:-translate-y-1 gap-2.5 rounded-xl font-semibold">
                <Phone className="w-5 h-5" />
                Call 800-INAYA
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}