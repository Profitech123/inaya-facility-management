import React from 'react';
import { BellRinging } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DashboardHeader({ user, hasActiveSub, unreadCount = 0 }) {
  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex items-center justify-between mb-7">
      <div>
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">{greeting}</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {user?.full_name?.split(' ')[0] || 'Welcome back'} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {hasActiveSub ? 'Your home is under active care.' : 'Manage your home services from here.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Link
          to={createPageUrl('Notifications')}
          className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-emerald-300 hover:shadow-sm transition-all"
        >
          <BellRinging className="w-5 h-5 text-slate-500" weight="duotone" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name?.split(' ')[0] || 'User'}</div>
            <div className={`text-[10px] font-medium ${hasActiveSub ? 'text-emerald-500' : 'text-slate-400'}`}>
              {hasActiveSub ? '● Premium' : '○ Free'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}