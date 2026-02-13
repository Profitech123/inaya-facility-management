import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <span className="w-8 h-0.5 bg-emerald-500" />
              <span className="text-emerald-500 font-bold text-sm tracking-wide uppercase">
                Premium Facility Management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-tight text-balance"
            >
              Professional Property Maintenance for{' '}
              <span className="text-emerald-500">Your Home.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-500 max-w-lg leading-relaxed"
            >
              Subscription and One-off facility management services in Dubai. We handle the repairs so you can enjoy your home worry-free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link to={createPageUrl('Subscriptions')}>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 h-auto rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                  Explore Packages
                </Button>
              </Link>
              <Link to={createPageUrl('OnDemandServices')}>
                <Button size="lg" variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 px-8 py-4 h-auto rounded-xl font-bold transition-all hover:border-slate-300 w-full sm:w-auto">
                  Book a Service
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 pt-4"
            >
              <div className="flex -space-x-2 mr-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                    <Users className="w-3 h-3 text-slate-500" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900">Trusted by 5,000+</p>
                <p className="text-slate-500">Dubai households</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl transform rotate-2" />
            <img
              alt="AC Maintenance Technician"
              className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              src="/images/hero-technician.jpg"
              loading="eager"
            />
            {/* Floating Badge */}
            <div className="absolute bottom-8 left-8 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">4.9/5</p>
                <p className="text-xs text-slate-500">Customer Rating</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
