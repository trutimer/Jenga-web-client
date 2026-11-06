import { ref } from 'vue';

declare const __APP_VERSION__: string;

export const isUpdateAvailable = ref(false);
export const newVersionString = ref('');
export const isDismissed = ref(false);

const CURRENT_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '4.2.1')
  .replace(/^v/i, '')
  .trim();

const CHECK_INTERVAL_MS = 3 * 60 * 1000; // Poll every 3 minutes

/**
 * Returns true if the client is running inside Electron desktop wrapper.
 * Electron handles updates via electron/updateManager.ts, so we skip web polling.
 */
export function isElectronEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).electron) || window.navigator.userAgent.includes('Electron');
}

/**
 * Checks public/version.json on the server for a newer version.
 */
export async function checkServerVersion(): Promise<boolean> {
  if (isElectronEnvironment()) return false;

  try {
    const response = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    const serverVersion = (data.version || '').replace(/^v/i, '').trim();

    if (serverVersion && serverVersion !== CURRENT_VERSION) {
      isUpdateAvailable.value = true;
      newVersionString.value = `v${serverVersion}`;
      return true;
    }
  } catch (err) {
    // Fail silently in background
    console.debug('[WebUpdate] Version check failed:', err);
  }
  return false;
}

let watcherInitialized = false;

/**
 * Initializes listeners to check for updates:
 * - Initial check
 * - Periodic polling every 3 minutes
 * - When user switches back to this tab (visibilitychange)
 * - When device reconnects to internet
 */
export function initWebUpdateWatcher(): void {
  if (watcherInitialized || isElectronEnvironment()) return;
  watcherInitialized = true;

  // 1. Initial check (staggered slightly to avoid slowing initial boot)
  setTimeout(() => {
    checkServerVersion();
  }, 4000);

  // 2. Periodic background check
  setInterval(() => {
    checkServerVersion();
  }, CHECK_INTERVAL_MS);

  // 3. WhatsApp Web style: Check when tab becomes visible
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion();
      }
    });
  }

  // 4. Check on network reconnect
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      checkServerVersion();
    });
  }
}

/**
 * Reloads the browser window to fetch the new version assets.
 */
export function reloadToUpdate(): void {
  window.location.reload();
}

/**
 * Temporarily dismisses the banner for the current session.
 */
export function dismissUpdateBanner(): void {
  isDismissed.value = true;
}
