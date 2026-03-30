import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AdminKPICard({ label, value, sub, trend, trendUp, icon: Icon, accent = 'emerald' }) {
  const colors = {
    emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    blue:    { bg: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600' },
    violet:  { bg: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-600' },
    amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600' },
    rose:    { bg: 'bg-rose-500',    light: 'bg-rose-50',    text: 'text-rose-600' },
    teal:    { bg: 'bg-teal-500',    light: 'bg-teal-50',    text: 'text-teal-600' },
  };
  const c = colors[accent] || colors.emerald;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      {sub && <div className={`text-[11px] ${c.text} font-medium`}>{sub}</div>}
    </div>
  );
}