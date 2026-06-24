import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Calendar, CreditCard, User } from 'lucide-react';

const TABS = [
  { page: 'Dashboard', label: 'Home', Icon: LayoutDashboard },
  { page: 'MyBookings', label: 'Bookings', Icon: Calendar },
  { page: 'MySubscriptions', label: 'Plans', Icon: CreditCard },
  { page: 'UserProfile', label: 'Profile', Icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex safe-bottom lg:hidden">
      {TABS.map(({ page, label, Icon }) => {
        const active = currentPath === page;
        return (
          <Link
            key={page}
            to={createPageUrl(page)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}