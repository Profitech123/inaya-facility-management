import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Zap, Clock, Users, BarChart3, TrendingUp, CalendarDays,
  Settings, LogOut, Menu, X, ChevronLeft, Bell, Search, Wrench, MessageSquare,
  FileText, Shield, ChevronDown
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', page: 'AdminDashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Bookings', page: 'AdminBookings', icon: Zap },
      { label: 'Subscriptions', page: 'AdminSubscriptions', icon: Clock },
      { label: 'Services', page: 'AdminServices', icon: Wrench },
    ]
  },
  {
    label: 'Team',
    items: [
      { label: 'Technicians', page: 'AdminTechnicians', icon: Users },
      { label: 'Schedules', page: 'AdminTechSchedule', icon: CalendarDays },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Analytics', page: 'AdminAnalytics', icon: TrendingUp },
      { label: 'Reports', page: 'AdminReports', icon: BarChart3 },
    ]
  },
  {
    label: 'Support',
    items: [
      { label: 'Tickets', page: 'AdminSupport', icon: MessageSquare },
      { label: 'Live Chat', page: 'AdminLiveChat', icon: MessageSquare },
      { label: 'Audit Logs', page: 'AdminAuditLogs', icon: FileText },
    ]
  }
];

export default function AdminLayout({ children, currentPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const adminToken = sessionStorage.getItem('inaya_admin_session');
    if (adminToken !== 'authenticated') {
      window.location.href = createPageUrl('AdminLogin');
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('inaya_admin_session');
    window.location.href = createPageUrl('AdminLogin');
  };

  const currentLabel = navGroups.flatMap(g => g.items).find(n => n.page === currentPage)?.label || currentPage?.replace('Admin', '') || 'Dashboard';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-6'} h-[72px] border-b border-white/[0.06] flex-shrink-0`}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl bg-[hsl(160,60%,38%)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
        ) : (
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-8"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-[hsl(160,60%,38%)] text-white shadow-lg shadow-[hsl(160,60%,38%)]/20'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? '' : 'group-hover:text-white'}`} />
                    {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`border-t border-white/[0.06] p-3 space-y-1 flex-shrink-0`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden lg:flex w-full items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all`}
        >
          <ChevronLeft className={`w-[18px] h-[18px] transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="text-[13px] font-medium">Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all`}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[hsl(220,15%,96%)]">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-[hsl(210,20%,8%)] transition-all duration-300 flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-[hsl(210,20%,8%)]">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-[hsl(220,15%,90%)] flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-[hsl(220,15%,96%)] rounded-xl transition-colors" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5 text-[hsl(210,20%,30%)]" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[hsl(210,20%,10%)] tracking-tight">{currentLabel}</h1>
              <p className="text-xs text-[hsl(210,10%,55%)] hidden sm:block">INAYA Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-[hsl(220,15%,96%)] rounded-xl px-4 py-2 gap-2 w-64">
              <Search className="w-4 h-4 text-[hsl(210,10%,55%)]" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-[hsl(210,20%,10%)] placeholder-[hsl(210,10%,55%)] w-full"
              />
            </div>
            <button className="relative p-2.5 hover:bg-[hsl(220,15%,96%)] rounded-xl transition-colors">
              <Bell className="w-[18px] h-[18px] text-[hsl(210,10%,45%)]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(160,60%,38%)] rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(160,60%,38%)] to-[hsl(160,80%,28%)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
