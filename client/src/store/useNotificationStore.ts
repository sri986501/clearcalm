import { create } from 'zustand';
import api from '../lib/axios';

export interface NotificationItem {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'EXPIRY' | 'PAYMENT' | 'VERIFICATION';
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const list: NotificationItem[] = res.data.notifications || [];
      const unread = list.filter(n => !n.isRead).length;
      set({ notifications: list, unreadCount: unread });
    } catch (e) {
      // ignore
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length
        };
      });
    } catch (e) {
      // fallback local update
      set((state) => {
        const updated = state.notifications.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length
        };
      });
    }
  }
}));
