import React from 'react';
import { ArrowRight, Star, Shield, Clock, Award } from 'lucide-react';
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
    <div className="relative min-h-screen flex items-center overflow-hidden bg-[#F8F7F4]">
      {/* Architectural background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle warm tone wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F4] via-white to-[#F0F4F0]" />
        {/* Large organic blob — top right */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-emerald-100/50 blur-[120px]" />
        {/* Small accent — bottom left */}
        <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-teal-50/60 blur-[100px]" />
        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(15,23,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,1) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-16 lg:py-32 relative w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-6 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-6 xl:col-span-7">
            {/* Eyebrow tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="flex items-center gap-2.5 border border-emerald-200 bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-[11px] font-semibold tracking-[0.2em] uppercase">Dubai's Premier FM Partner</span>
              </div>
            </motion.div>

            {/* Headline — editorial mix */}
            <div className="mb-8 overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="leading-[1.03] tracking-[-0.03em]"
              >
                <span className="block font-sans font-light text-[3rem] md:text-[3.75rem] lg:text-[4.25rem] text-slate-400 italic">
                  Your Property,
                </span>
                <span className="block font-display font-bold text-[3.4rem] md:text-[4.5rem] lg:text-[5.25rem] text-slate-900 mt-1">
                  Our Expertise.
                </span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg font-light"
            >
              Premium facilities management for Dubai's finest properties — subscription plans, on-demand services, and 24/7 emergency response by certified professionals.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 mb-14"
            >
              <Link to={createPageUrl('Subscriptions')}>
                <button className="group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-luxury hover:shadow-luxury-lg w-full sm:w-auto">
                  Explore Packages
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>
              <Link to={createPageUrl('OnDemandServices')}>
                <button className="group flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 px-8 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-luxury w-full sm:w-auto">
                  Book a Service
                </button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex items-center gap-5"
            >
              <div className="flex -space-x-3">
                {AVATARS.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-md" />
                ))}
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  <span className="text-sm font-bold text-slate-800 ml-1.5">4.9</span>
                </div>
                <p className="text-xs text-slate-500">Trusted by <strong className="text-slate-700 font-semibold">5,000+</strong> households</p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — Image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 xl:col-span-5 relative"
          >
            {/* Frame glow */}
            <div className="absolute -inset-6 bg-gradient-to-br from-emerald-100/60 to-teal-50/40 rounded-[2.5rem] blur-xl rotate-1" />

            <div className="relative rounded-[2rem] overflow-hidden shadow-luxury-xl">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/95350b0d1_generated_image.png"
                alt="INAYA professional technician"
                className="w-full h-[420px] lg:h-[540px] object-cover"
                loading="eager"
              />
              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>

            {/* Floating card — bottom left */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-5 py-4 shadow-luxury-lg border border-slate-100/80 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/25">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">4.9 / 5</div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Customer Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Floating card — top right */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute -top-5 -right-5 bg-white rounded-2xl px-5 py-4 shadow-luxury-lg border border-slate-100/80 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-none tracking-tight">ISO Certified</div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">9001 · 14001 · 45001</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200/60 rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm"
        >
          {[
            { value: '700+', label: 'Expert Professionals', icon: Award },
            { value: '24/7', label: 'Emergency Response',   icon: Clock },
            { value: '549+', label: 'Hectares Managed',     icon: Shield },
            { value: '5,000+', label: 'Happy Households',   icon: Star },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white/90 backdrop-blur-sm px-6 py-6 flex items-center gap-4 hover:bg-white transition-colors duration-200 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{stat.value}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}