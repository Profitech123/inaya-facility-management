import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: 'hsl(40,20%,98%)' }}>
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(210,20%,10%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,20%,10%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3"
            >
              <div className="w-10 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
                Premium Facility Management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-balance"
              style={{ color: 'hsl(210,20%,10%)', fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Property care,{' '}
              <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>elevated.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: 'hsl(210,10%,46%)' }}
            >
              Bespoke maintenance subscriptions and on-demand services for discerning homeowners across Dubai. We handle every detail so you never have to.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link to={createPageUrl('Subscriptions')}>
                <Button size="lg" className="text-white px-8 py-6 h-auto rounded-full font-semibold text-sm tracking-wide transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
                  Explore Packages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('OnDemandServices')}>
                <Button size="lg" variant="outline" className="px-8 py-6 h-auto rounded-full font-semibold text-sm tracking-wide transition-all duration-300 w-full sm:w-auto" style={{ borderColor: 'hsl(40,10%,85%)', color: 'hsl(210,20%,10%)' }}>
                  Book a Service
                </Button>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-8 pt-8 border-t"
              style={{ borderColor: 'hsl(40,10%,90%)' }}
            >
              <div>
                <p className="text-3xl font-bold" style={{ color: 'hsl(210,20%,10%)' }}>5,000+</p>
                <p className="text-xs tracking-wide uppercase mt-1" style={{ color: 'hsl(210,10%,46%)' }}>Homes Served</p>
              </div>
              <div className="w-[1px] h-12" style={{ backgroundColor: 'hsl(40,10%,90%)' }} />
              <div>
                <p className="text-3xl font-bold" style={{ color: 'hsl(210,20%,10%)' }}>4.9</p>
                <p className="text-xs tracking-wide uppercase mt-1" style={{ color: 'hsl(210,10%,46%)' }}>Customer Rating</p>
              </div>
              <div className="w-[1px] h-12 hidden sm:block" style={{ backgroundColor: 'hsl(40,10%,90%)' }} />
              <div className="hidden sm:block">
                <p className="text-3xl font-bold" style={{ color: 'hsl(210,20%,10%)' }}>15+</p>
                <p className="text-xs tracking-wide uppercase mt-1" style={{ color: 'hsl(210,10%,46%)' }}>Years Experience</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                alt="Premium facility management services in Dubai"
                className="w-full object-cover h-[520px] lg:h-[600px]"
                src="/images/hero-technician.jpg"
                loading="eager"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -left-6 top-1/3 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border"
              style={{ borderColor: 'hsl(40,10%,92%)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(160,60%,38%)', color: 'white' }}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'hsl(210,20%,10%)' }}>Verified Experts</p>
                <p className="text-xs" style={{ color: 'hsl(210,10%,46%)' }}>Licensed & Insured</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border"
              style={{ borderColor: 'hsl(40,10%,92%)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(40,80%,55%)', color: 'white' }}>
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'hsl(210,20%,10%)' }}>4.9/5 Rating</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[0,1,2,3,4].map(i => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
