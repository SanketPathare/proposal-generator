'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { AppNotification, NotificationType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import {
  Bell,
  BellOff,
  Eye,
  CheckCircle2,
  XCircle,
  Radio,
  Trash2,
  CheckCheck,
  FileText,
  ArrowLeft,
} from 'lucide-react';

const NOTIFICATION_CONFIG: Record<NotificationType, { icon: typeof Eye; color: string; bg: string }> = {
  proposal_viewed: { icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  accept_request: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  proposal_accepted: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  proposal_rejected: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  proposal_live: { icon: Radio, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getNotifications(user.uid);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    try {
      await firestoreHelpers.markNotificationRead(user.uid, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await firestoreHelpers.markAllNotificationsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[#f4f4f5] text-[#71717a] hover:text-[#09090b] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Notifications</h1>
            <p className="text-sm text-[#71717a] mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="font-semibold text-xs gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#09090b] text-white shadow-sm'
              : 'bg-[#f4f4f5] text-[#71717a] hover:bg-[#e4e4e7] hover:text-[#09090b]'
          }`}
        >
          All
          <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'all' ? 'bg-white/20' : 'bg-white'}`}>
            {notifications.length}
          </span>
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-[#09090b] text-white shadow-sm'
              : 'bg-[#f4f4f5] text-[#71717a] hover:bg-[#e4e4e7] hover:text-[#09090b]'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${filter === 'unread' ? 'bg-white/20' : 'bg-white'}`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
          <div className="h-14 w-14 rounded-2xl bg-[#f4f4f5] flex items-center justify-center mx-auto text-[#71717a] mb-4">
            <BellOff className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#09090b]">No notifications yet</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            Notifications will appear here when clients view, accept, or decline your proposals.
          </p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e4e4e7] text-[#71717a]">
          <BellOff className="h-8 w-8 mx-auto mb-2 text-[#a1a1aa]" />
          <p className="text-sm font-medium">No unread notifications</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => setFilter('all')}>
            View all
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.proposal_viewed;
            const Icon = config.icon;
            return (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-sm ${
                  !notification.read ? 'border-[#09090b]/10 bg-[#fcfcfd]' : 'bg-white'
                }`}
              >
                <div className="p-4 flex items-start gap-4">
                  {/* Icon */}
                  <div className={`h-10 w-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold ${!notification.read ? 'text-[#09090b]' : 'text-[#52525b]'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-[#71717a] mt-0.5 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-[#d4ff00] shrink-0 mt-1.5" />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-[#a1a1aa]">
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.proposalTitle && (
                        <button
                          onClick={() => router.push(`/proposals/${notification.proposalId}`)}
                          className="text-[11px] font-semibold text-[#09090b] hover:underline flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          {notification.proposalTitle}
                        </button>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-[11px] font-semibold text-[#71717a] hover:text-[#09090b] transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
