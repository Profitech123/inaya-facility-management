import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <div className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border border-white -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full border border-white translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-emerald-100 text-sm font-medium">Get Started Today</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-7 leading-tight">
            Ready to Experience Professional{' '}
            <span className="text-emerald-200">Facilities Management?</span>
          </h2>
          <p className="text-xl text-emerald-100/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Book your first service in minutes, choose a subscription package, or contact us to discuss your property's needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl('OnDemandServices')}>
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8 h-14 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 font-semibold">
                Book Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:600546292">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-14 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                <Phone className="w-5 h-5 mr-2" />
                6005-INAYA (46292)
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}