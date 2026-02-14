import React from 'react';
import { BellRinging } from '@phosphor-icons/react';

export default function DashboardHeader({ user }) {
  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
      </h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
          <BellRinging className="w-5 h-5 text-slate-500" weight="duotone" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</div>
            <div className="text-xs text-slate-400">Premium Member</div>
          </div>
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 border-2 border-emerald-200">
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}