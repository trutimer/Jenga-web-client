import { ref, computed, watch } from 'vue';
import { notificationService } from '../services/notificationService';
import type { NotificationInboxItem } from '../models/types';
import { showToast } from '../services/toastService';
import { websocketService, type RealtimeNotificationEvent } from '../services/websocketService';
import { isElectron } from '../services/offlineSalesService';

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

  let wsUnsubscribe: (() => void) | null = null;
  let wsReconnectStopWatch: (() => void) | null = null;

  const setupWebSocket = () => {
    if (isElectron()) return; // Notifications via WebSocket do not apply to Electron desktop
    if (wsUnsubscribe) return;
    const userId = localStorage.getItem('userId');
    const storeId = localStorage.getItem('storeId');
    if (!userId && !storeId) return;

    // Ensure WebSocket client is connected
    websocketService.connect();

    const handleIncoming = (event: RealtimeNotificationEvent) => {
      // Deduplicate by recipientId or notificationId
      const exists = notifications.value.some(
        (n) => (event.recipientId && n.recipientId === event.recipientId) ||
               (event.notificationId && n.notificationId === event.notificationId)
      );
      if (exists) return;

      unreadCount.value++;
      const newNotif: NotificationInboxItem = {
        recipientId: event.recipientId,
        notificationId: event.notificationId,
        title: event.title,
        message: event.message,
        type: (event.type as any) || 'GENERAL',
        priority: (event.priority as any) || 'MEDIUM',
        actionUrl: event.actionUrl,
        isRead: false,
        read: false,
        createdAt: event.createdAt || new Date().toISOString()
      };
      notifications.value = [newNotif, ...notifications.value];
      totalElements.value++;
      showToast(`${event.title}: ${event.message}`, 'info');
    };

    const unsubUser = userId ? websocketService.onUserNotifications(userId, handleIncoming) : () => {};
    const unsubStore = (storeId && storeId !== 'null' && storeId !== 'undefined')
      ? websocketService.onStoreNotifications(storeId, handleIncoming)
      : () => {};

    wsUnsubscribe = () => {
      unsubUser();
      unsubStore();
    };

    // Reconcile unread count once when recovering from a connection interruption
    if (!wsReconnectStopWatch) {
      wsReconnectStopWatch = watch(
        () => websocketService.isConnected.value,
        (connected, prev) => {
          if (connected && prev === false) {
            fetchUnreadCount();
          }
        }
      );
    }
  };

  /**
   * Initializes notification synchronization.
   * - In the web browser: loads baseline unread count ONCE, then relies 100% on real-time WebSocket push.
   *   No periodic HTTP polling interval is run.
   * - In Electron desktop: runs a relaxed fallback polling interval since WebSockets are disabled.
   */
  const startPolling = (intervalMs = 60000) => {
    // 1. Clean up any existing state first
    stopPolling();

    // 2. Baseline fetch: load current unread count once on initialization
    fetchUnreadCount();

    // 3. In the browser, listen via real-time WebSocket with ZERO periodic polling
    if (!isElectron()) {
      setupWebSocket();
    } else {
      // Electron desktop fallback: poll at a relaxed interval (default: 60s)
      pollTimer = setInterval(() => {
        fetchUnreadCount();
      }, Math.max(intervalMs, 60000));
    }
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (wsUnsubscribe) {
      wsUnsubscribe();
      wsUnsubscribe = null;
    }
    if (wsReconnectStopWatch) {
      wsReconnectStopWatch();
      wsReconnectStopWatch = null;
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
