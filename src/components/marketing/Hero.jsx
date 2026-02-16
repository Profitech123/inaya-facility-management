import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
];

export default function Hero() {
  return (
    <div className="relative bg-slate-50 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 right-1/3 w-[500px] h-[500px] rounded-full bg-emerald-500 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-[3px] bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 text-xs font-bold tracking-[0.2em] uppercase">
                Premium Facility Management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-[3.5rem] font-bold text-slate-900 leading-[1.1] mb-6"
            >
              Professional Property
              <br />
              Maintenance for{' '}
              <span className="text-emerald-500">Your Home.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg"
            >
              From subscription plans to one-off services — expert maintenance for Dubai villas and apartments, delivered by certified professionals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link to={createPageUrl('Subscriptions')}>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-8 h-13 shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 gap-2 w-full sm:w-auto">
                  Explore Packages <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl('OnDemandServices')}>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-white text-base px-8 h-13 w-full sm:w-auto">
                  Book a Service
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-slate-500">Trusted by <strong className="text-slate-700">5,000+</strong> Dubai households</p>
              </div>
            </motion.div>
          </div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative shape */}
            <div className="absolute -top-6 -right-6 w-full h-full bg-emerald-100/60 rounded-3xl rotate-3 -z-10" />
            
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700&q=80"
                alt="Professional technician performing home maintenance"
                className="w-full h-[420px] lg:h-[480px] object-cover"
                loading="eager"
              />
            </div>

            {/* Rating badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-4 shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold text-slate-900">4.9/5</span>
              </div>
              <p className="text-xs text-slate-400">Customer Rating</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}