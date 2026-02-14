import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { List, X } from 'lucide-react';
import { SquaresFour, Lightning, Timer, UsersThree, CalendarDots, ChartLineUp, ChartBar, SignOut } from '@phosphor-icons/react';

const navItems = [
  { label: 'Dashboard', page: 'AdminDashboard', icon: SquaresFour },
  { label: 'Service Requests', page: 'AdminBookings', icon: Lightning },
  { label: 'Subscriptions', page: 'AdminSubscriptions', icon: Timer },
  { label: 'Technicians', page: 'AdminTechnicians', icon: UsersThree },
  { label: 'Tech Schedules', page: 'AdminTechSchedule', icon: CalendarDots },
  { label: 'Analytics', page: 'AdminAnalytics', icon: ChartLineUp },
  { label: 'Reports', page: 'AdminReports', icon: ChartBar },
];

export default function AdminLayout({ children, currentPage }) {
  const [sidebarOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-8"
          />
          <span className="text-sm font-medium text-slate-400">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <SignOut className="w-4 h-4" weight="duotone" />
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}