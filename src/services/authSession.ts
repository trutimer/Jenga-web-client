import { showToast } from './toastService';
import { clearAuthStorage } from './deviceService';
import { websocketService } from './websocketService';
import { isElectron } from './offlineSalesService';
import { t } from '@/i18n';
import router from '@/router';

let onSessionExpireCallback: (() => void) | null = null;
let isHandlingExpiry = false;

/**
 * Register a callback to reset in-memory app state (e.g. user.value = null)
 * when a session expires.
 */
export function registerSessionExpireCallback(cb: () => void): void {
  onSessionExpireCallback = cb;
}

/**
 * Decodes and parses the payload of a JWT token.
 * Returns null if the token is missing, malformed, or unparseable.
 */
export function parseJwtPayload(token?: string | null): any | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const rawToken = token.startsWith('Bearer ') || token.startsWith('bearer ')
      ? token.slice(7).trim()
      : token.trim();
    const parts = rawToken.split('.');
    if (parts.length < 2 || !parts[1]) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    if (typeof atob !== 'undefined') {
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const decodedStr = new TextDecoder().decode(bytes);
      return JSON.parse(decodedStr);
    }
    return null;
  } catch {
    try {
      const rawToken = token.startsWith('Bearer ') || token.startsWith('bearer ')
        ? token.slice(7).trim()
        : token.trim();
      const parts = rawToken.split('.');
      if (parts.length >= 2 && parts[1] && typeof atob !== 'undefined') {
        return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      }
    } catch {
      // Unparseable token string
    }
    return null;
  }
}

/**
 * Checks whether a given JWT token is expired.
 * @param token The JWT access token string
 * @param bufferSeconds Buffer window in seconds to prevent race conditions (default: 30s)
 */
export function isJwtExpired(token?: string | null, bufferSeconds = 30): boolean {
  if (!token || typeof token !== 'string' || token.trim() === '') return true;
  const payload = parseJwtPayload(token);
  if (!payload) return true;
  if (typeof payload.exp !== 'number') return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= (nowInSeconds + bufferSeconds);
}

/**
 * Returns remaining seconds until token expiration, or 0 if expired/invalid.
 */
export function getTokenRemainingSeconds(token?: string | null): number {
  if (!token) return 0;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return 0;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const diff = payload.exp - nowInSeconds;
  return diff > 0 ? diff : 0;
}

/**
 * Centralized handler for expired or invalidated sessions.
 * Clears authentication tokens, disconnects real-time services,
 * resets UI state, and redirects user cleanly to the login screen.
 */
export function handleSessionExpired(customMessage?: string, silent = false): void {
  if (isHandlingExpiry) return;
  isHandlingExpiry = true;

  try {
    console.warn('[AuthSession] Session expired or revoked. Logging out user...');

    // 1. Disconnect real-time websockets immediately
    try {
      websocketService.disconnect();
    } catch (e) {
      console.warn('Failed to disconnect websocket on session expiry:', e);
    }

    // 2. Clear token in Electron background sync worker so background jobs stop sending it
    if (isElectron()) {
      try {
        (window as any).ipcRenderer?.invoke('sync:set-config', { token: '' });
      } catch (err) {
        console.warn('Failed to clear sync token in Electron:', err);
      }
    }

    // 3. Clear auth storage (preserves hardware deviceId and remembered phone)
    clearAuthStorage();

    // 4. Notify app viewmodel to reset user/role/branch reactive state
    if (onSessionExpireCallback) {
      try {
        onSessionExpireCallback();
      } catch (err) {
        console.error('Error in onSessionExpireCallback:', err);
      }
    }

    // 5. Notify user if requested and not already on the login page
    const currentPath = router?.currentRoute?.value?.path || '';
    if (!silent && currentPath !== '/login') {
      const message = customMessage || t('auth.sessionExpired') || 'Your session has expired. Please log in again.';
      showToast(message, 'info');
    }

    // 6. Navigate to login route
    if (router && currentPath !== '/login') {
      router.push('/login').catch(() => {});
    }
  } finally {
    // Release debounce lock after 1.5 seconds
    setTimeout(() => {
      isHandlingExpiry = false;
    }, 1500);
  }
}
