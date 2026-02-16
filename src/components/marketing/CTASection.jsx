import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <div className="relative py-28 overflow-hidden">
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
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-7 leading-tight">
            Ready for a<br />
            <span className="text-emerald-200">Maintenance-Free Life?</span>
          </h2>
          <p className="text-xl text-emerald-100/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Book your first service in minutes, subscribe to a plan, or call us to discuss your property's unique needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl('OnDemandServices')}>
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8 h-14 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 font-semibold gap-2">
                Book Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:600546292">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-14 backdrop-blur-sm transition-all hover:-translate-y-0.5 gap-2">
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