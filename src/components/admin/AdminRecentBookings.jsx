import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

const STATUS_STYLES = {
  completed:   'bg-emerald-100 text-emerald-700',
  confirmed:   'bg-blue-100 text-blue-700',
  in_progress: 'bg-violet-100 text-violet-700',
  cancelled:   'bg-red-100 text-red-600',
  pending:     'bg-amber-100 text-amber-700',
  en_route:    'bg-teal-100 text-teal-700',
  delayed:     'bg-orange-100 text-orange-700',
};

export default function AdminRecentBookings({ bookings, services }) {
  const recent = bookings.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Recent Bookings</h3>
          <p className="text-xs text-slate-400 mt-0.5">{bookings.length} total</p>
        </div>
        <Link to={createPageUrl('AdminBookings')} className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {recent.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">No bookings yet</div>
        )}
        {recent.map(b => {
          const svc = services.find(s => s.id === b.service_id);
          return (
            <div key={b.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">
                #{b.id.slice(-4).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{svc?.name || 'Service'}</div>
                <div className="text-xs text-slate-400">{b.scheduled_date}{b.scheduled_time ? ` · ${b.scheduled_time}` : ''}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-700">AED {b.total_amount}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'}`}>
                  {b.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}