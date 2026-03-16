import React from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Briefcase, CheckCircle2, LogOut } from 'lucide-react';

export default function MobileProfile({ provider, completedCount, activeCount }) {
  const handleLogout = () => base44.auth.logout();

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Avatar + name */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold flex-shrink-0">
          {provider?.full_name?.charAt(0) || 'T'}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg leading-tight">{provider?.full_name}</p>
          <p className="text-sm text-slate-500">{provider?.email}</p>
          {provider?.average_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-700">{provider.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <Briefcase className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
          <p className="text-xs text-slate-500">Active Jobs</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
      </div>

      {/* Specializations */}
      {provider?.specialization?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {provider.specialization.map((s, i) => (
              <span key={i} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 border border-red-100"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}