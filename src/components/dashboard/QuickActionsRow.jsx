import React from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickActionsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link to={createPageUrl('Services')} className="group p-5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl hover:border-emerald-300 transition-all hover:shadow-md">
        <PlusCircle className="w-8 h-8 text-emerald-500 mb-3" />
        <div className="font-semibold text-slate-900 text-sm mb-1">Book a One-off Service</div>
        <div className="text-xs text-slate-500 leading-relaxed">Need a quick fix? Schedule a single visit for any facility need.</div>
      </Link>
      <Link to={createPageUrl('Subscriptions')} className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all hover:shadow-md">
        <RefreshCw className="w-8 h-8 text-slate-400 mb-3" />
        <div className="font-semibold text-slate-900 text-sm mb-1">Renew Subscription</div>
        <div className="text-xs text-slate-500 leading-relaxed">Extend your current plan for another year and keep your peace of mind.</div>
      </Link>
    </div>
  );
}