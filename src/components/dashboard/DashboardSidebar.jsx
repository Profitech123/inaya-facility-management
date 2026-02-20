import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Package, Clock, CalendarDays, Settings, LogOut, Home, CreditCard } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { label: 'Subscriptions', icon: Package, page: 'MySubscriptions' },
  { label: 'Bookings', icon: CalendarDays, page: 'MyBookings' },
  { label: 'Payments', icon: CreditCard, page: 'PaymentHistory' },
  { label: 'Properties', icon: Home, page: 'MyProperties' },
  { label: 'Profile', icon: Settings, page: 'UserProfile' },
];

export default function DashboardSidebar({ currentPage }) {
  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen fixed left-0 top-0 z-40" style={{ backgroundColor: 'hsl(210,20%,8%)' }}>
      {/* Logo */}
      <div className="px-5 h-[72px] border-b border-white/[0.06] flex items-center">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(160,60%,38%), hsl(160,80%,28%))' }}>
            <span className="text-white font-bold text-xs">IN</span>
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">INAYA</div>
            <div className="text-[9px] text-white/30 uppercase tracking-[0.15em]">My Account</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.label}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[hsl(160,60%,38%)] text-white shadow-lg shadow-[hsl(160,60%,38%)]/20'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={() => { try { localStorage.removeItem('base44_access_token'); localStorage.removeItem('token'); } catch {} window.location.href = '/'; }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
