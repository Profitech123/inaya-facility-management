import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationItem from './NotificationItem';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create' && event.data?.user_id === userId) {
        setNotifications(prev => [event.data, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      } else if (event.type === 'update' && event.data?.user_id === userId) {
        setNotifications(prev => prev.map(n => n.id === event.id ? event.data : n));
      }
    });

    return unsubscribe;
  }, [userId]);

  const loadNotifications = async () => {
    const all = await base44.entities.Notification.filter(
      { user_id: userId }, '-created_date', 20
    );
    setNotifications(all);
    setUnreadCount(all.filter(n => !n.is_read).length);
  };

  const markAsRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 max-h-[480px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 8).map(n => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <Link
            to={createPageUrl('Notifications')}
            className="block text-center text-xs font-medium text-emerald-600 hover:bg-slate-50 py-3 border-t border-slate-100"
          >
            View all notifications
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}