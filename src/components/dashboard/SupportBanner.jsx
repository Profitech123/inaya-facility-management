import React from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SupportBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6">
      {/* Decorative */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-24 w-24 h-24 bg-white/3 rounded-full pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Headphones className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-1">Need help with your property?</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Our support team and emergency technicians are available 24/7.
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 flex-shrink-0">
          <Link to={createPageUrl('Support')}>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl text-sm font-semibold"
            >
              Help Center
            </Button>
          </Link>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold gap-2 shadow-lg shadow-emerald-900/30">
              Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}