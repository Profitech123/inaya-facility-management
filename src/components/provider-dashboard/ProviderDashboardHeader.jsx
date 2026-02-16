import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Briefcase, Clock } from 'lucide-react';
import moment from 'moment';

export default function ProviderDashboardHeader({ provider, todayCount, activeCount }) {
  const greeting = moment().hour() < 12 ? 'Good Morning' : moment().hour() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center overflow-hidden flex-shrink-0">
            {provider?.profile_image ? (
              <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-emerald-400">{provider?.full_name?.[0] || 'P'}</span>
            )}
          </div>
          <div>
            <p className="text-emerald-300 text-sm font-medium">{greeting}</p>
            <h1 className="text-2xl font-bold">{provider?.full_name || 'Provider'}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              {provider?.average_rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {provider.average_rating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {provider?.total_jobs_completed || 0} jobs
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/10">
            <p className="text-2xl font-bold text-emerald-400">{todayCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Today's Jobs</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/10">
            <p className="text-2xl font-bold text-amber-400">{activeCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}