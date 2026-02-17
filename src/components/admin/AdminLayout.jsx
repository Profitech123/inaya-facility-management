import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { SquaresFour, Lightning, Timer, UsersThree, CalendarDots, ChartLineUp, ChartBar, Wrench, SignOut, ChatCircleDots, Gear, FileText, ShieldCheck, Invoice, MapPin, UserList, UploadSimple, EnvelopeSimple } from '@phosphor-icons/react';

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', page: 'AdminDashboard', icon: SquaresFour },
      { label: 'Service Requests', page: 'AdminBookings', icon: Lightning },
      { label: 'Subscriptions', page: 'AdminSubscriptions', icon: Timer },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Services & Pricing', page: 'AdminServices', icon: Wrench },
      { label: 'Technicians', page: 'AdminTechnicians', icon: UsersThree },
      { label: 'Tech Schedules', page: 'AdminTechSchedule', icon: CalendarDots },
      { label: 'Service Areas', page: 'AdminServiceAreas', icon: MapPin },
    ],
  },
  {
    label: 'Customers & Billing',
    items: [
      { label: 'Customers', page: 'AdminCustomers', icon: UserList },
      { label: 'Invoices', page: 'AdminInvoices', icon: Invoice },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', page: 'AdminAnalytics', icon: ChartLineUp },
      { label: 'Reports', page: 'AdminReports', icon: ChartBar },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Live Chat', page: 'AdminLiveChat', icon: ChatCircleDots },
      { label: 'Support Tickets', page: 'AdminSupport', icon: ShieldCheck },
      { label: 'Email Templates', page: 'AdminEmailTemplates', icon: EnvelopeSimple },
      { label: 'Audit Logs', page: 'AdminAuditLogs', icon: FileText },
      { label: 'CSV Import', page: 'AdminCSVMigration', icon: UploadSimple },
    ],
  },
];

export default function AdminLayout({ children, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-slate-950 text-white z-40 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-white/[0.06] flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
          {collapsed ? (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              IN
            </div>
          ) : (
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
              alt="INAYA"
              className="h-8"
            />
          )}
          {!collapsed && <span className="ml-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-3 mb-2">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
                        collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" weight={isActive ? 'fill' : 'regular'} />
                      {!collapsed && (
                        <span className="text-[13px] font-medium">{item.label}</span>
                      )}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors text-xs"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 mt-1 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <SignOut className="w-[18px] h-[18px] flex-shrink-0" weight="duotone" />
            {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[280px] bg-slate-950 text-white flex flex-col shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
                alt="INAYA"
                className="h-8"
              />
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {navSections.map(section => (
                <div key={section.label}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-3 mb-2">{section.label}</p>
                  <div className="space-y-0.5">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.page;
                      return (
                        <Link
                          key={item.page}
                          to={createPageUrl(item.page)}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <Icon className="w-[18px] h-[18px]" weight={isActive ? 'fill' : 'regular'} />
                          <span className="text-[13px] font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="border-t border-white/[0.06] p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <SignOut className="w-[18px] h-[18px]" weight="duotone" />
                <span className="text-[13px] font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
        {/* Top bar for mobile */}
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/7d33a7d25_Screenshot2026-02-12at93002AM.png"
            alt="INAYA"
            className="h-7"
          />
          <div className="w-9" />
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}