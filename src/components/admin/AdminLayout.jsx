import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, LayoutDashboard, Zap, Clock, Users, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', page: 'AdminDashboard', icon: LayoutDashboard },
  { label: 'Service Requests', page: 'AdminBookings', icon: Zap },
  { label: 'Subscriptions', page: 'AdminSubscriptions', icon: Clock },
  { label: 'Technicians', page: 'AdminTechnicians', icon: Users },
  { label: 'Reports', page: 'AdminReports', icon: BarChart3 },
];

export default function AdminLayout({ children, currentPage }) {
  const [sidebarOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="h-20 border-b border-slate-200 flex items-center justify-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className={`${sidebarOpen ? 'h-8' : 'h-6'} transition-all`}
          />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={() => setMobileMenuOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-xs font-medium ml-2">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {navItems.find(n => n.page === currentPage)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <div className="w-10 h-10 rounded-full bg-slate-300" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}