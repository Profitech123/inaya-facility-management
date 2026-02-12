import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, Calendar, Package, Wrench, BarChart3,
  HeadphonesIcon, MessageSquare, FileText, Database, Shield,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const adminNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'AdminDashboard' },
  { label: 'Bookings', icon: Calendar, page: 'AdminBookings' },
  { label: 'Subscriptions', icon: Package, page: 'AdminSubscriptions' },
  { label: 'Services', icon: Wrench, page: 'AdminServices' },
  { label: 'Reports', icon: BarChart3, page: 'AdminReports' },
  { label: 'Support Tickets', icon: HeadphonesIcon, page: 'AdminSupport' },
  { label: 'Live Chat', icon: MessageSquare, page: 'AdminLiveChat' },
  { label: 'Audit Logs', icon: FileText, page: 'AdminAuditLogs' },
  { label: 'CSV Migration', icon: Database, page: 'AdminCSVMigration' },
  { label: 'Technicians', icon: Shield, page: 'AdminProviderDetail' },
];

export default function AdminLayout({ children, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">INAYA Admin</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Control Panel</div>
          </div>
          <button className="lg:hidden ml-auto text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to={createPageUrl('Home')}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
            View Website
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/50 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-h-screen bg-slate-50 lg:rounded-tl-3xl lg:rounded-bl-3xl overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">INAYA Admin</span>
        </div>

        {children}
      </div>
    </div>
  );
}