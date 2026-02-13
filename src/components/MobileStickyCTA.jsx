import React from 'react';
import { Phone, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MobileStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9997] lg:hidden bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch">
        <Link
          to={createPageUrl('OnDemandServices')}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white font-semibold text-sm transition-colors hover:bg-emerald-700"
        >
          <CalendarCheck className="w-4 h-4" />
          Book a Service
        </Link>
        <a
          href="tel:600546292"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-slate-800 font-semibold text-sm transition-colors hover:bg-slate-50"
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          Call 6005-INAYA
        </a>
      </div>
    </div>
  );
}
