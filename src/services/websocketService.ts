import { ref, type Ref } from 'vue';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { BASE_URL } from './api';
import { isElectron } from './offlineSalesService';

export type WebSocketConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';

export interface RealtimeEnvelope<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  traceId?: string;
}

export interface RealtimeSaleEvent {
  branchId: string;
  saleId?: string;
  receiptNumber?: string;
  totalAmount?: number;
  paymentMethod?: string;
  cashierName?: string;
  timestamp?: string;
}

export interface RealtimeShiftEvent {
  branchId: string;
  shiftId?: string;
  cashierId?: string;
  cashierName?: string;
  openingCash?: number;
  closingCash?: number;
  discrepancy?: number;
  eventType: 'SHIFT_OPENED' | 'SHIFT_CLOSED';
  timestamp?: string;
}

export interface RealtimeCashMovementEvent {
  branchId: string;
  movementId?: string;
  type: string;
  amount: number;
  reason?: string;
  cashierName?: string;
  timestamp?: string;
}

export interface RealtimeNotificationEvent {
  notificationId: string;
  recipientId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  actionUrl?: string;
  createdAt: string;
}

export interface RealtimeHealthEvent {
  status: string;
  timestamp: string;
  activeConnections?: number;
}

export interface RealtimeDashboardKpiEvent {
  branchId: string;
  totalSales: number;
  transactionsCount: number;
  netCashflow: number;
  timestamp: string;
}

export type MessageCallback<T = any> = (payload: T, envelope: RealtimeEnvelope<T>) => void;

class WebSocketService {
  private client: Client | null = null;
  private shouldBeConnected: boolean = false;

  public readonly isConnected: Ref<boolean> = ref(false);
  public readonly connectionState: Ref<WebSocketConnectionState> = ref('DISCONNECTED');
  public readonly lastMessageTimestamp: Ref<string | null> = ref(null);

  // Map of destination -> Set of callbacks
  private topicListeners = new Map<string, Set<MessageCallback>>();
  // Map of destination -> active STOMP subscription
  private stompSubscriptions = new Map<string, StompSubscription>();

  /**
   * Builds the native WebSocket URL (ws:// or wss://) with query param token
   */
  private getWebSocketUrl(token?: string): string {
    let url = BASE_URL.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
    if (!url.endsWith('/ws')) {
      url = `${url.replace(/\/+$/, '')}/ws`;
    }
    if (token) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}token=${encodeURIComponent(token)}`;
    }
    return url;
  }

  /**
   * Initializes and starts the STOMP connection via native browser WebSocket
   */
  public connect(): void {
    if (isElectron()) {
      return; // WebSocket does not apply to the desktop version (Electron)
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    this.shouldBeConnected = true;

    if (this.client && this.client.active) {
      return; // Already connected or connecting
    }

    this.connectionState.value = 'CONNECTING';

    const wsUrl = this.getWebSocketUrl(token);

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        token: token
      },
      heartbeatIncoming: 25000,
      heartbeatOutgoing: 25000,
      reconnectDelay: 5000,
      beforeConnect: () => {
        const freshToken = localStorage.getItem('accessToken') || '';
        if (this.client) {
          this.client.brokerURL = this.getWebSocketUrl(freshToken);
          this.client.connectHeaders = {
            Authorization: `Bearer ${freshToken}`,
            token: freshToken
          };
        }
      },
      onConnect: () => {
        this.isConnected.value = true;
        this.connectionState.value = 'CONNECTED';
        console.log('[WebSocket] Connected securely to STOMP broker via native WebSocket.');

        // Re-subscribe to all registered topics
        this.resubscribeAll();
      },
      onDisconnect: () => {
        this.isConnected.value = false;
        this.connectionState.value = this.shouldBeConnected ? 'RECONNECTING' : 'DISCONNECTED';
        this.stompSubscriptions.clear();
        console.log('[WebSocket] Disconnected from STOMP broker.');
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error frame:', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => {
        this.isConnected.value = false;
        if (this.shouldBeConnected) {
          this.connectionState.value = 'RECONNECTING';
        } else {
          this.connectionState.value = 'DISCONNECTED';
        }
        this.stompSubscriptions.clear();
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          // Debug STOMP if needed
        }
      }
    });

    try {
      this.client.activate();
    } catch (err) {
      console.error('[WebSocket] Activation failed:', err);
      this.connectionState.value = 'DISCONNECTED';
    }
  }

  /**
   * Resubscribe all registered topics after connect/reconnect
   */
  private resubscribeAll(): void {
    if (!this.client || !this.client.connected) return;

    this.topicListeners.forEach((callbacks, topic) => {
      if (callbacks.size > 0 && !this.stompSubscriptions.has(topic)) {
        this.bindStompSubscription(topic);
      }
    });
  }

  /**
   * Internal helper to subscribe on the active STOMP client
   */
  private bindStompSubscription(topic: string): void {
    if (!this.client || !this.client.connected) return;

    try {
      const sub = this.client.subscribe(topic, (message: IMessage) => {
        this.lastMessageTimestamp.value = new Date().toISOString();
        let envelope: RealtimeEnvelope;
        try {
          envelope = JSON.parse(message.body);
        } catch {
          envelope = {
            type: 'RAW',
            payload: message.body,
            timestamp: new Date().toISOString()
          };
        }

        const listeners = this.topicListeners.get(topic);
        if (listeners) {
          listeners.forEach((cb) => {
            try {
              cb(envelope.payload ?? envelope, envelope);
            } catch (err) {
              console.error(`[WebSocket] Error in callback for ${topic}:`, err);
            }
          });
        }
      });

      this.stompSubscriptions.set(topic, sub);
    } catch (err) {
      console.error(`[WebSocket] Failed to subscribe to ${topic}:`, err);
    }
  }

  /**
   * Subscribe to an arbitrary topic. Returns an unsubscribe function.
   */
  public subscribe<T = any>(topic: string, callback: MessageCallback<T>): () => void {
    if (isElectron()) {
      return () => {}; // No-op for Electron desktop version
    }

    if (!this.topicListeners.has(topic)) {
      this.topicListeners.set(topic, new Set());
    }
    this.topicListeners.get(topic)!.add(callback as MessageCallback);

    // If client is already connected and no subscription exists yet, create it now
    if (this.client && this.client.connected && !this.stompSubscriptions.has(topic)) {
      this.bindStompSubscription(topic);
    } else if (!this.client || !this.client.active) {
      // Auto-connect if not already started
      this.connect();
    }

    return () => {
      const listeners = this.topicListeners.get(topic);
      if (listeners) {
        listeners.delete(callback as MessageCallback);
        if (listeners.size === 0) {
          this.topicListeners.delete(topic);
          const sub = this.stompSubscriptions.get(topic);
          if (sub) {
            try {
              sub.unsubscribe();
            } catch (e) {
              // Ignore cleanup error
            }
            this.stompSubscriptions.delete(topic);
          }
        }
      }
    };
  }

  /**
   * Disconnect STOMP broker cleanly
   */
  public disconnect(): void {
    this.shouldBeConnected = false;
    this.stompSubscriptions.forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch {}
    });
    this.stompSubscriptions.clear();
    this.topicListeners.clear();

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        console.error('[WebSocket] Deactivate error:', err);
      }
      this.client = null;
    }
    this.isConnected.value = false;
    this.connectionState.value = 'DISCONNECTED';
  }

  // ==========================================
  // Typed Topic Subscriptions
  // ==========================================

  /**
   * Real-time sales for a specific branch (SALE_COMPLETED, SALE_REVERSED)
   */
  public onBranchSales(branchId: string, callback: MessageCallback<RealtimeSaleEvent>): () => void {
    return this.subscribe<RealtimeSaleEvent>(`/topic/branch/${branchId}/sales`, callback);
  }

  /**
   * Real-time shifts for a specific branch (SHIFT_OPENED, SHIFT_CLOSED)
   */
  public onBranchShifts(branchId: string, callback: MessageCallback<RealtimeShiftEvent>): () => void {
    return this.subscribe<RealtimeShiftEvent>(`/topic/branch/${branchId}/shifts`, callback);
  }

  /**
   * Real-time cash movements for a specific branch (PAY_IN, PAY_OUT, DROP)
   */
  public onBranchCashMovements(branchId: string, callback: MessageCallback<RealtimeCashMovementEvent>): () => void {
    return this.subscribe<RealtimeCashMovementEvent>(`/topic/branch/${branchId}/cash-movements`, callback);
  }

  /**
   * Real-time dashboard KPI push events for a specific branch
   */
  public onBranchDashboard(branchId: string, callback: MessageCallback<RealtimeDashboardKpiEvent>): () => void {
    return this.subscribe<RealtimeDashboardKpiEvent>(`/topic/branch/${branchId}/dashboard`, callback);
  }

  /**
   * Real-time store-level sales (for multi-branch owner view)
   */
  public onStoreSales(storeId: string, callback: MessageCallback<RealtimeSaleEvent>): () => void {
    return this.subscribe<RealtimeSaleEvent>(`/topic/store/${storeId}/sales`, callback);
  }

  /**
   * Real-time notifications for the logged in user
   */
  public onUserNotifications(userId: string, callback: MessageCallback<RealtimeNotificationEvent>): () => void {
    // Spring STOMP user queue (canonical user point-to-point destination)
    const unsubUserQueue = this.subscribe<RealtimeNotificationEvent>('/user/queue/notifications', callback);
    // Explicit user ID destination fallback
    const unsubExplicit = userId ? this.subscribe<RealtimeNotificationEvent>(`/user/${userId}/queue/notifications`, callback) : () => {};

    return () => {
      unsubUserQueue();
      unsubExplicit();
    };
  }

  /**
   * Real-time store broadcast notifications (for managers and store owners)
   */
  public onStoreNotifications(storeId: string, callback: MessageCallback<RealtimeNotificationEvent>): () => void {
    return this.subscribe<RealtimeNotificationEvent>(`/topic/store/${storeId}/notifications`, callback);
  }

  /**
   * Real-time system health heartbeat
   */
  public onSystemHealth(callback: MessageCallback<RealtimeHealthEvent>): () => void {
    return this.subscribe<RealtimeHealthEvent>('/topic/system/health', callback);
  }
}

export const websocketService = new WebSocketService();
