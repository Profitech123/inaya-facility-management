import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SquaresFour, Package as PhPackage, CalendarDots, GearSix, SignOut, Monitor, List, X } from '@phosphor-icons/react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Dashboard', icon: SquaresFour, page: 'Dashboard' },
  { label: 'Client Portal', icon: Monitor, page: 'ClientPortal' },
  { label: 'My Subscriptions', icon: PhPackage, page: 'MySubscriptions' },
  { label: 'My Bookings', icon: CalendarDots, page: 'MyBookings' },
  { label: 'Settings', icon: GearSix, page: 'UserProfile' },
];

function SidebarContent({ currentPage, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">IN</span>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">INAYA</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Facility Management</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.label}
              to={createPageUrl(item.page)}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" weight={isActive ? "fill" : "duotone"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => base44.auth.logout(window.location.origin + createPageUrl('Home'))}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <SignOut className="w-[18px] h-[18px]" weight="duotone" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar({ currentPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-14">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
          <List className="w-5 h-5 text-slate-600" weight="bold" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">IN</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">INAYA</span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl">
            <SidebarContent currentPage={currentPage} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 z-40">
        <SidebarContent currentPage={currentPage} />
      </aside>
    </>
  );
}