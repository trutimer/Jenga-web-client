import type { Router } from 'vue-router';
import { BASE_URL } from './api';

export interface TelemetryEvent {
  featureKey: string;
  featureName?: string;
  eventType?: 'CLICK' | 'PAGE_VIEW' | 'SEARCH' | 'EXPORT' | 'MODAL_OPEN' | 'SHORTCUT_KEY';
  pageRoute?: string;
  componentId?: string;
  deviceType?: string;
  sessionId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

// =============================================================================
// In-Memory Telemetry Event Buffer & Batching Engine (Client-side Ingestion Only)
// =============================================================================

const BUFFER_MAX_SIZE = 10;
const FLUSH_INTERVAL_MS = 5000;
let eventBuffer: TelemetryEvent[] = [];
let flushTimer: any = null;
let currentSessionId = '';
let isInitialized = false;

function getSessionId(): string {
  if (currentSessionId) return currentSessionId;
  try {
    const stored = sessionStorage.getItem('duka_telemetry_sess');
    if (stored) {
      currentSessionId = stored;
      return stored;
    }
    currentSessionId = 'sess_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
    sessionStorage.setItem('duka_telemetry_sess', currentSessionId);
  } catch {
    currentSessionId = 'sess_' + Math.random().toString(36).slice(2, 10);
  }
  return currentSessionId;
}

export async function flushTelemetryQueue(): Promise<void> {
  if (eventBuffer.length === 0) return;

  const toSend = [...eventBuffer];
  eventBuffer = [];

  try {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = JSON.stringify({ events: toSend });
    const url = `${BASE_URL}/api/v1/telemetry/events/batch`;

    // Attempt navigator.sendBeacon when tab is closing if supported
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function' && document.visibilityState === 'hidden') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }

    await fetch(url, {
      method: 'POST',
      headers,
      body: payload,
      keepalive: true
    });
  } catch (err) {
    // Re-queue un-sent events once if network failed temporarily
    if (eventBuffer.length < 50) {
      eventBuffer.unshift(...toSend);
    }
    console.debug('[Telemetry] Flush failed, events buffered:', err);
  }
}

function startFlushTimer() {
  if (!flushTimer) {
    flushTimer = setInterval(() => {
      flushTelemetryQueue();
    }, FLUSH_INTERVAL_MS);
  }
}

/**
 * Enqueue a feature telemetry event. Flushes immediately if queue hits threshold.
 */
export function trackFeature(
  featureKey: string,
  featureName?: string,
  options?: Partial<TelemetryEvent>
): void {
  if (!featureKey) return;

  const event: TelemetryEvent = {
    featureKey: featureKey.trim().toUpperCase(),
    featureName: featureName || featureKey,
    eventType: options?.eventType || 'CLICK',
    pageRoute: options?.pageRoute || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    componentId: options?.componentId,
    deviceType: options?.deviceType,
    sessionId: getSessionId(),
    durationMs: options?.durationMs,
    metadata: options?.metadata
  };

  eventBuffer.push(event);

  if (eventBuffer.length >= BUFFER_MAX_SIZE) {
    flushTelemetryQueue();
  } else {
    startFlushTimer();
  }
}

/**
 * Initialize global telemetry hooks:
 * 1. Declarative click tracker for [data-telemetry] and [data-feature] elements
 * 2. Automatic route view tracker
 * 3. Unload flush listeners
 */
export function initTelemetry(router?: Router): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Declarative DOM click listener
  document.addEventListener(
    'click',
    (event) => {
      try {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const el = target.closest('[data-telemetry], [data-feature]') as HTMLElement | null;
        if (el) {
          const key = el.getAttribute('data-telemetry') || el.getAttribute('data-feature');
          if (key) {
            const name =
              el.getAttribute('data-telemetry-name') ||
              el.getAttribute('title') ||
              el.getAttribute('aria-label') ||
              el.innerText?.slice(0, 40)?.trim() ||
              key;
            const compId = el.id || el.getAttribute('data-component') || undefined;

            trackFeature(key, name, {
              eventType: 'CLICK',
              componentId: compId
            });
          }
        }
      } catch (e) {
        console.debug('[Telemetry] Click capture error:', e);
      }
    },
    { passive: true }
  );

  // 2. Automatic route transition tracker
  if (router) {
    router.afterEach((to) => {
      try {
        const routeName = String(to.name || to.path);
        const featureKey = `PAGE_VIEW_${routeName.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
        trackFeature(featureKey, `Navigate to ${routeName}`, {
          eventType: 'PAGE_VIEW',
          pageRoute: to.fullPath
        });
      } catch (e) {
        console.debug('[Telemetry] Route capture error:', e);
      }
    });
  }

  // 3. Flush queue on page unload
  window.addEventListener('beforeunload', () => {
    flushTelemetryQueue();
  });
  window.addEventListener('pagehide', () => {
    flushTelemetryQueue();
  });

  startFlushTimer();
}

export const telemetryService = {
  track: trackFeature,
  flush: flushTelemetryQueue
};
