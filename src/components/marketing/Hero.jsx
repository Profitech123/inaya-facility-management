import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Play, Shield, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
];

export default function Hero() {
  return (
    <div className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-slate-50" />
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-teal-50/60 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left — 7 columns */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="flex items-center gap-2 bg-emerald-600/10 border border-emerald-200/60 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-xs font-semibold tracking-wide uppercase">
                  Dubai's #1 Facility Management
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold text-slate-900 leading-[1.05] mb-7 tracking-tight"
            >
              Your Property,{' '}
              <br className="hidden sm:block" />
              <span className="relative">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  Our Expertise.
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-xl text-slate-500 mb-10 leading-relaxed max-w-xl font-light"
            >
              Premium maintenance for Dubai's finest properties. Subscription plans, on-demand services, and 24/7 emergency response — all by certified professionals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to={createPageUrl('Subscriptions')}>
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white text-base px-8 h-14 shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-slate-900/30 gap-2.5 w-full sm:w-auto rounded-xl font-semibold">
                  Explore Packages <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl('OnDemandServices')}>
                <Button size="lg" variant="outline" className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-base px-8 h-14 w-full sm:w-auto rounded-xl font-semibold gap-2.5 transition-all">
                  <Play className="w-4 h-4 fill-current" /> Book a Service
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-5"
            >
              <div className="flex -space-x-3">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-md ring-1 ring-slate-100" />
                ))}
              </div>
              <div className="border-l border-slate-200 pl-5">
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  <span className="text-sm font-bold text-slate-800 ml-1">4.9</span>
                </div>
                <p className="text-sm text-slate-500">Trusted by <strong className="text-slate-700">5,000+</strong> households</p>
              </div>
            </motion.div>
          </div>

          {/* Right — 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 relative"
          >
            {/* Main image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200/30 to-teal-100/20 rounded-[2rem] rotate-2 blur-sm" />
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/95350b0d1_generated_image.png"
                  alt="Professional technician performing home maintenance"
                  className="w-full h-[440px] lg:h-[520px] object-cover"
                  loading="eager"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-white/80"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 leading-none">4.9/5</div>
                    <p className="text-xs text-slate-500 font-medium">Customer Rating</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.85 }}
                className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-white/80"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-slate-900 leading-none">ISO Certified</div>
                    <p className="text-xs text-slate-500 font-medium">9001 · 14001 · 45001</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200/60 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm"
        >
          {[
            { value: '700+', label: 'Expert Professionals', icon: Award },
            { value: '24/7', label: 'Emergency Response', icon: Clock },
            { value: '549+', label: 'Hectares Managed', icon: Shield },
            { value: '5,000+', label: 'Happy Households', icon: Star },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white/80 backdrop-blur-sm px-6 py-5 flex items-center gap-4 hover:bg-white transition-colors">
                <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}