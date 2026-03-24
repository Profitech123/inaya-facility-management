import React from 'react';
import { BellRinging } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DashboardHeader({ user, hasActiveSub, unreadCount = 0 }) {
  const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
  const memberLabel = hasActiveSub ? 'Premium Member' : 'Free Account';

  return (
    <header className="flex items-center justify-between mb-8 pt-2 lg:pt-0">
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
      </h1>
      <div className="flex items-center gap-4">
        <Link to={createPageUrl('Notifications')} className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
          <BellRinging className="w-5 h-5 text-slate-500" weight="duotone" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</div>
            <div className={`text-xs ${hasActiveSub ? 'text-emerald-500 font-medium' : 'text-slate-400'}`}>{memberLabel}</div>
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