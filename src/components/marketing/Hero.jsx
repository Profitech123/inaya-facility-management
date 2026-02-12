import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, Award, Zap, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative bg-slate-50 overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-emerald-600 text-sm font-bold tracking-widest mb-6 uppercase">
                Professional FM Solutions
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight"
            >
              Your Home,
              <br />
              <span className="text-emerald-500">Perfectly</span>
              <br />
              Maintained.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl"
            >
              Professional home maintenance services in Dubai. Professional home management services & expert maintenance to protect your property.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to={createPageUrl('Subscriptions')}>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-8 h-12 shadow-lg transition-all hover:-translate-y-0.5">
                  Explore Packages
                </Button>
              </Link>
              <Link to={createPageUrl('Services')}>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-base px-8 h-12">
                  Book a Service
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-6 text-sm text-slate-600"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Trusted by 1000+ homeowners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Member of Belhasa Group</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80"
                alt="Professional maintenance technician"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {/* Decorative shape behind image */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-100 rounded-full blur-xl opacity-60 -z-10" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}