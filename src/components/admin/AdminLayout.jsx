import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { List, X } from 'lucide-react';
import { SquaresFour, Lightning, Timer, UsersThree, CalendarDots, ChartLineUp, ChartBar, Wrench, SignOut } from '@phosphor-icons/react';

const navItems = [
  { label: 'Dashboard', page: 'AdminDashboard', icon: SquaresFour },
  { label: 'Service Requests', page: 'AdminBookings', icon: Lightning },
  { label: 'Subscriptions', page: 'AdminSubscriptions', icon: Timer },
  { label: 'Services & Pricing', page: 'AdminServices', icon: Wrench },
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
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={() => setMobileMenuOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
          </button>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-8"
          />
          <span className="text-sm font-medium text-slate-400">Admin</span>
        </div>
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto flex-1 mx-6">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <Link key={item.page} to={createPageUrl(item.page)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                <Icon className="w-3.5 h-3.5" weight={isActive ? 'fill' : 'regular'} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <SignOut className="w-4 h-4" weight="duotone" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {sidebarOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                <Icon className="w-3.5 h-3.5" weight={isActive ? 'fill' : 'regular'} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Page Content */}
      <div className="p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}