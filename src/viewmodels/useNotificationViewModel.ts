import { ref, computed } from 'vue';
import { notificationService } from '../services/notificationService';
import type { NotificationInboxItem } from '../models/types';
import { showToast } from '../services/toastService';

// Global shared state for real-time notification synchronization across views
const unreadCount = ref<number>(0);
const notifications = ref<NotificationInboxItem[]>([]);
const isLoading = ref<boolean>(false);
const isActionLoading = ref<boolean>(false);
const unreadOnlyFilter = ref<boolean>(false);
const currentPage = ref<number>(0);
const totalPages = ref<number>(0);
const totalElements = ref<number>(0);

let pollTimer: any = null;

export function useNotificationViewModel() {
  const badgeText = computed<string>(() => {
    if (!unreadCount.value || unreadCount.value <= 0) return '';
    if (unreadCount.value > 99) return '99+';
    return String(unreadCount.value);
  });

  const hasUnread = computed<boolean>(() => unreadCount.value > 0);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await notificationService.getUnreadCount();
      if (res && typeof res.unreadCount === 'number') {
        unreadCount.value = res.unreadCount;
      }
    } catch (err) {
      console.warn('Failed to fetch unread notification count:', err);
    }
  };

  const normalizeNotification = (raw: any): NotificationInboxItem => {
    const isRead = raw.isRead !== undefined 
      ? Boolean(raw.isRead) 
      : (raw.read !== undefined ? Boolean(raw.read) : Boolean(raw.readAt));
    return {
      ...raw,
      isRead,
      read: isRead
    };
  };

  const fetchNotifications = async (reset = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (reset) {
      currentPage.value = 0;
    }

    isLoading.value = true;
    try {
      const pageRes = await notificationService.getInbox({
        unreadOnly: unreadOnlyFilter.value,
        page: currentPage.value,
        size: 20
      });

      if (pageRes) {
        const rawContent = pageRes.content || [];
        const normalized = rawContent.map(normalizeNotification);
        if (reset || currentPage.value === 0) {
          notifications.value = normalized;
        } else {
          notifications.value = [...notifications.value, ...normalized];
        }
        totalPages.value = pageRes.totalPages || 0;
        totalElements.value = pageRes.totalElements || 0;
      }
      // Also refresh unread count
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (recipientId: string) => {
    try {
      const updated = await notificationService.markAsRead(recipientId);
      if (updated) {
        const item = notifications.value.find((n) => n.recipientId === recipientId);
        if (item) {
          item.isRead = true;
          item.read = true;
          item.readAt = updated.readAt || new Date().toISOString();
          if (unreadCount.value > 0) {
            unreadCount.value--;
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount.value === 0 && !notifications.value.some((n) => !n.isRead)) {
      return;
    }

    isActionLoading.value = true;
    try {
      const res = await notificationService.markAllAsRead();
      notifications.value.forEach((n) => {
        n.isRead = true;
        n.read = true;
        n.readAt = new Date().toISOString();
      });
      unreadCount.value = 0;
      showToast(res.message || 'All notifications marked as read', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to mark all as read', 'error');
    } finally {
      isActionLoading.value = false;
    }
  };

  const archiveNotification = async (recipientId: string) => {
    isActionLoading.value = true;
    try {
      await notificationService.archiveNotification(recipientId);
      const target = notifications.value.find((n) => n.recipientId === recipientId);
      if (target && !target.isRead && unreadCount.value > 0) {
        unreadCount.value--;
      }
      notifications.value = notifications.value.filter((n) => n.recipientId !== recipientId);
      showToast('Notification removed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove notification', 'error');
    } finally {
      isActionLoading.value = false;
    }
  };

  const startPolling = (intervalMs = 30000) => {
    stopPolling();
    fetchUnreadCount();
    pollTimer = setInterval(() => {
      fetchUnreadCount();
    }, intervalMs);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const formatRelativeTime = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 45) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return {
    unreadCount,
    badgeText,
    hasUnread,
    notifications,
    isLoading,
    isActionLoading,
    unreadOnlyFilter,
    currentPage,
    totalPages,
    totalElements,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    startPolling,
    stopPolling,
    formatRelativeTime
  };
}
