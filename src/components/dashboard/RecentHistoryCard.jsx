import React from 'react';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecentHistoryCard({ bookings, services, providers = [] }) {
  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Service';
  const getProviderName = (id) => providers.find(p => p.id === id)?.full_name || null;

  const completed = bookings.filter(b => b.status === 'completed').slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Service History</span>
        </div>
        <Link to={createPageUrl('MyBookings') + '?tab=past'} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
          All History <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5">
        {completed.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No history yet</p>
            <p className="text-xs text-slate-400 leading-relaxed">Your completed services will appear here.</p>
          </div>
        ) : (
          <>
            {completed.map(booking => {
              const rawDate = booking.completed_at || booking.scheduled_date;
              const formattedDate = rawDate
                ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '';
              const providerName = getProviderName(booking.assigned_provider_id);

              return (
                <Link key={booking.id} to={createPageUrl('BookingDetail') + '?id=' + booking.id}>
                  <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-xs truncate">{getServiceName(booking.service_id)}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formattedDate}{providerName ? ` · ${providerName}` : ''}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}