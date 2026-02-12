import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Package, Clock, CalendarDays, Settings, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { label: 'My Subscriptions', icon: Package, page: 'MySubscriptions' },
  { label: 'Service History', icon: Clock, page: 'MyBookings' },
  { label: 'Bookings', icon: CalendarDays, page: 'MyBookings' },
  { label: 'Settings', icon: Settings, page: 'UserProfile' },
];

export default function DashboardSidebar({ currentPage }) {
  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">IN</span>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">INAYA</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Facility Management</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page || (item.page === 'Dashboard' && currentPage === 'Dashboard');
          return (
            <Link
              key={item.label}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}