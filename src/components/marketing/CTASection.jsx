import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6 text-balance">
            Ready for a Maintenance-Free Life?
          </h2>
          <p className="text-xl text-slate-500 mb-10">
            Join thousands of families in Dubai who trust INAYA for their home comfort.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={createPageUrl('OnDemandServices')}>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 h-auto rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                Book Now
              </Button>
            </Link>
            <a href="tel:800-46292">
              <Button size="lg" variant="outline" className="bg-white hover:bg-slate-50 text-emerald-500 border-2 border-emerald-500 px-8 py-4 h-auto rounded-xl font-bold text-lg transition-all w-full sm:w-auto">
                <Phone className="w-5 h-5 mr-2" />
                Call 800-INAYA
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
