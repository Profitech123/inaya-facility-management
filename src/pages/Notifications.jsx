import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthGuard from '../components/AuthGuard';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationItem from '../components/notifications/NotificationItem';

function NotificationsContent() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const markAsRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 text-xs">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You'll be notified about booking updates, service completions, and more.
              </p>
            </div>
          ) : (
            filtered.map(n => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} showFull />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  return (
    <AuthGuard requiredRole="customer">
      <NotificationsContent />
    </AuthGuard>
  );
}