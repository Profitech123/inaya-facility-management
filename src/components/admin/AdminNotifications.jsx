import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  AlertTriangle, Clock, Bell, CalendarX, ShieldAlert, Users,
  ArrowRight, AlertCircle, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, isValid } from 'date-fns';

export default function AdminNotifications({ bookings, subscriptions, tickets, providers }) {
  const notifications = useMemo(() => {
    const items = [];
    const today = new Date();

    // 1. Urgent support tickets
    const urgentTickets = tickets.filter(t =>
      t.priority === 'urgent' && (t.status === 'open' || t.status === 'in_progress')
    );
    urgentTickets.forEach(t => {
      items.push({
        id: `ticket-${t.id}`,
        type: 'urgent',
        icon: ShieldAlert,
        color: 'text-red-600',
        bg: 'bg-red-50',
        borderColor: 'border-red-200',
        title: `Urgent ticket: ${t.subject}`,
        description: `#${t.ticket_number} — ${t.category || 'general'} priority`,
        link: createPageUrl('AdminSupport'),
        linkLabel: 'View Ticket',
        time: t.created_date,
      });
    });

    // 2. High priority open tickets older than 24h
    const staleHighTickets = tickets.filter(t => {
      if (t.priority !== 'high' || t.status === 'resolved' || t.status === 'closed') return false;
      if (!t.created_date) return false;
      const created = parseISO(t.created_date);
      return isValid(created) && differenceInDays(today, created) >= 1;
    });
    if (staleHighTickets.length > 0) {
      items.push({
        id: 'stale-high-tickets',
        type: 'warning',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: `${staleHighTickets.length} high-priority ticket${staleHighTickets.length > 1 ? 's' : ''} awaiting response`,
        description: 'Open for more than 24 hours',
        link: createPageUrl('AdminSupport'),
        linkLabel: 'Review Tickets',
      });
    }

    // 3. Unassigned bookings (confirmed but no provider)
    const unassigned = bookings.filter(b =>
      (b.status === 'confirmed' || b.status === 'pending') && !b.assigned_provider_id
    );
    if (unassigned.length > 0) {
      items.push({
        id: 'unassigned-bookings',
        type: 'warning',
        icon: Users,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: `${unassigned.length} booking${unassigned.length > 1 ? 's' : ''} without a technician`,
        description: 'Assign a provider to avoid service delays',
        link: createPageUrl('AdminBookings'),
        linkLabel: 'Assign Now',
      });
    }

    // 4. Overdue bookings (scheduled date has passed but still pending/confirmed)
    const overdue = bookings.filter(b => {
      if (b.status !== 'pending' && b.status !== 'confirmed') return false;
      if (!b.scheduled_date) return false;
      const scheduled = parseISO(b.scheduled_date);
      return isValid(scheduled) && scheduled < today;
    });
    if (overdue.length > 0) {
      items.push({
        id: 'overdue-bookings',
        type: 'urgent',
        icon: CalendarX,
        color: 'text-red-600',
        bg: 'bg-red-50',
        borderColor: 'border-red-200',
        title: `${overdue.length} overdue booking${overdue.length > 1 ? 's' : ''} past scheduled date`,
        description: 'These bookings have not been completed on time',
        link: createPageUrl('AdminBookings'),
        linkLabel: 'Review Overdue',
      });
    }

    // 5. Subscriptions expiring within 7 days
    const expiringSoon = subscriptions.filter(s => {
      if (s.status !== 'active' || !s.end_date) return false;
      const end = parseISO(s.end_date);
      if (!isValid(end)) return false;
      const daysLeft = differenceInDays(end, today);
      return daysLeft >= 0 && daysLeft <= 7;
    });
    if (expiringSoon.length > 0) {
      items.push({
        id: 'expiring-subs',
        type: 'info',
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: `${expiringSoon.length} subscription${expiringSoon.length > 1 ? 's' : ''} expiring this week`,
        description: 'Consider reaching out for renewals',
        link: createPageUrl('AdminSubscriptions'),
        linkLabel: 'View Subscriptions',
      });
    }

    // 6. Technicians with low ratings
    const lowRated = providers.filter(p => p.is_active && p.average_rating > 0 && p.average_rating < 3);
    if (lowRated.length > 0) {
      items.push({
        id: 'low-rated-techs',
        type: 'warning',
        icon: Wrench,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: `${lowRated.length} technician${lowRated.length > 1 ? 's' : ''} with rating below 3.0`,
        description: lowRated.map(p => `${p.full_name} (${p.average_rating?.toFixed(1)}★)`).join(', '),
        link: createPageUrl('AdminTechnicians'),
        linkLabel: 'Review',
      });
    }

    // Sort: urgent first, then warning, then info
    const order = { urgent: 0, warning: 1, info: 2 };
    items.sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9));

    return items;
  }, [bookings, subscriptions, tickets, providers]);

  if (notifications.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="py-6 text-center">
          <Bell className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-emerald-700 font-medium">All clear — no critical alerts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Notifications</CardTitle>
            <Badge className="bg-red-100 text-red-700 text-[10px]">{notifications.length}</Badge>
          </div>
          <AlertCircle className="w-4 h-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", n.bg, n.borderColor)}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", n.bg)}>
                <Icon className={cn("w-4 h-4", n.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900">{n.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{n.description}</div>
              </div>
              {n.link && (
                <Link to={n.link} className={cn("flex items-center gap-1 text-xs font-medium flex-shrink-0 mt-1", n.color, "hover:underline")}>
                  {n.linkLabel} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}