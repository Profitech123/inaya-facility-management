import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wrench, CalendarDays, Users, FileText, MapPin, BarChart3, ClipboardList, Settings, MessageSquare, ShieldCheck, Truck, Package } from 'lucide-react';

const ACTIONS = [
  { label: 'Services',       page: 'AdminServices',      icon: Wrench,       accent: 'emerald' },
  { label: 'Bookings',       page: 'AdminBookings',       icon: CalendarDays, accent: 'blue' },
  { label: 'Subscriptions',  page: 'AdminSubscriptions',  icon: Package,      accent: 'violet' },
  { label: 'Customers',      page: 'AdminCustomers',      icon: Users,        accent: 'amber' },
  { label: 'Invoices',       page: 'AdminInvoices',       icon: FileText,     accent: 'teal' },
  { label: 'Service Areas',  page: 'AdminServiceAreas',   icon: MapPin,       accent: 'rose' },
  { label: 'Technicians',    page: 'AdminTechnicians',    icon: Truck,        accent: 'orange' },
  { label: 'Tech Schedule',  page: 'AdminTechSchedule',   icon: ClipboardList,accent: 'emerald' },
  { label: 'Support',        page: 'AdminSupport',        icon: MessageSquare,accent: 'blue' },
  { label: 'Analytics',      page: 'AdminAnalytics',      icon: BarChart3,    accent: 'violet' },
  { label: 'Reports',        page: 'AdminReports',        icon: ShieldCheck,  accent: 'amber' },
  { label: 'Audit Logs',     page: 'AdminAuditLogs',      icon: Settings,     accent: 'slate' },
];

const ACCENT_COLORS = {
  emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  blue:    'bg-blue-50    text-blue-700    hover:bg-blue-100',
  violet:  'bg-violet-50  text-violet-700  hover:bg-violet-100',
  amber:   'bg-amber-50   text-amber-700   hover:bg-amber-100',
  teal:    'bg-teal-50    text-teal-700    hover:bg-teal-100',
  rose:    'bg-rose-50    text-rose-700    hover:bg-rose-100',
  orange:  'bg-orange-50  text-orange-700  hover:bg-orange-100',
  slate:   'bg-slate-100  text-slate-600   hover:bg-slate-200',
};

export default function AdminQuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ label, page, icon: Icon, accent }) => (
          <Link key={page} to={createPageUrl(page)}>
            <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors cursor-pointer ${ACCENT_COLORS[accent]}`}>
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}