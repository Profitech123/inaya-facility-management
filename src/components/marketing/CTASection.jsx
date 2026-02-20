import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden"
          style={{ backgroundColor: 'hsl(210,20%,6%)' }}
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,45%)' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,45%)' }}>
                Get Started
              </span>
              <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,45%)' }} />
            </motion.div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 text-balance" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Ready for a{' '}
              <span className="italic" style={{ color: 'hsl(160,60%,45%)' }}>maintenance-free</span>{' '}
              life?
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
              Join thousands of families across Dubai who trust INAYA to keep their homes in perfect condition.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to={createPageUrl('OnDemandServices')}>
                <Button size="lg" className="text-white px-10 py-6 h-auto rounded-full font-semibold text-sm tracking-wide transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto" style={{ backgroundColor: 'hsl(160,60%,38%)' }}>
                  Book Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="tel:800-46292">
                <Button size="lg" variant="outline" className="px-10 py-6 h-auto rounded-full font-semibold text-sm tracking-wide transition-all duration-300 w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  Call 800-INAYA
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
