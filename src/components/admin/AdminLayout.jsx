import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, LogOut, Settings, Bell, Search, Plus, Users,
  BarChart3, Zap, Clock, TrendingUp, AlertCircle
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard Overview', page: 'AdminDashboard', icon: LayoutDashboard },
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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Branding */}
          <Link to={createPageUrl('AdminDashboard')} className="flex items-center gap-3 px-2 hover:opacity-80 transition">
            <div className="size-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none">INAYA Admin</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Operations Portal</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">System Status</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Healthy</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 border-slate-200 dark:border-slate-800"
            onClick={() => {}}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {navItems.find(n => n.page === currentPage)?.label || 'Dashboard'}
              </h2>
              <div className="relative hidden sm:block flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button className="gap-2 hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4" />
                Create New
              </Button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex-shrink-0" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Logout Button (always visible) */}
      <button
        onClick={handleLogout}
        className="fixed bottom-6 left-6 p-2 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}