import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  CalendarCheck, Truck, Wrench, CheckCircle2, XCircle, Clock,
  CreditCard, UserCheck, RefreshCw, AlertTriangle, MessageSquare, Bell
} from 'lucide-react';
import moment from 'moment';

const TYPE_CONFIG = {
  booking_confirmed: { icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  technician_en_route: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  service_in_progress: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
  service_completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  booking_cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  booking_delayed: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  subscription_renewed: { icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' },
  subscription_expiring: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  quote_response: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  payment_received: { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  provider_assigned: { icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  general: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' },
};

export default function NotificationItem({ notification, onRead, showFull = false }) {
  const n = notification;
  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
  const Icon = config.icon;
  const timeAgo = moment(n.created_date).fromNow();

  const handleClick = () => {
    if (!n.is_read && onRead) onRead(n.id);
  };

  const content = (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-emerald-50/30' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4.5 h-4.5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
            {n.title}
          </p>
          {!n.is_read && <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />}
        </div>
        <p className={`text-xs text-slate-500 mt-0.5 ${showFull ? '' : 'line-clamp-2'}`}>{n.message}</p>
        <p className="text-[11px] text-slate-400 mt-1">{timeAgo}</p>
      </div>
    </div>
  );

  if (n.link_page) {
    const url = createPageUrl(n.link_page) + (n.link_params ? `?${n.link_params}` : '');
    return <Link to={url} className="block">{content}</Link>;
  }

  return content;
}