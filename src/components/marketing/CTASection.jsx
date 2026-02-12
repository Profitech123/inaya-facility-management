import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CTASection() {
  return (
    <div className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Ready to Experience Professional Facilities Management?
        </h2>
        <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
          Book your first service in minutes, choose a subscription package, or contact us to discuss your property's needs.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={createPageUrl('Services')}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 text-lg px-8 py-6">
              Book Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <a href="tel:600546292">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
              <Phone className="w-5 h-5 mr-2" />
              6005-INAYA (46292)
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}