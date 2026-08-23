import { api } from './api';
import type {
  NotificationInboxItem,
  PageResponse,
  UnreadCountResponse
} from '../models/types';

export const notificationService = {
  /**
   * Fetch inbox notifications with optional unread filter and pagination.
   */
  async getInbox(params?: {
    unreadOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<NotificationInboxItem>> {
    const query = new URLSearchParams();
    if (params?.unreadOnly !== undefined) {
      query.append('unreadOnly', params.unreadOnly.toString());
    }
    query.append('page', (params?.page ?? 0).toString());
    query.append('size', (params?.size ?? 20).toString());

    const endpoint = `/api/notifications?${query.toString()}`;
    return api.get<PageResponse<NotificationInboxItem>>(endpoint, { suppressToast: true });
  },

  /**
   * Fetch unread notification count for badge rendering.
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return api.get<UnreadCountResponse>('/api/notifications/unread-count', { suppressToast: true });
  },

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(recipientId: string): Promise<NotificationInboxItem> {
    return api.patch<NotificationInboxItem>(`/api/notifications/${recipientId}/read`, {}, { suppressToast: true });
  },

  /**
   * Mark all unread notifications as read for the current user.
   */
  async markAllAsRead(): Promise<{ updatedCount: number; message: string }> {
    return api.post<{ updatedCount: number; message: string }>('/api/notifications/mark-all-read', {}, { suppressToast: true });
  },

  /**
   * Archive / dismiss a notification.
   */
  async archiveNotification(recipientId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/notifications/${recipientId}`, { suppressToast: true });
  }
};
