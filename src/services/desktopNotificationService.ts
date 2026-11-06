import type { Router } from 'vue-router';
import { isElectron } from './offlineSalesService';

export interface DesktopNotificationOptions {
  title: string;
  message: string;
  actionUrl?: string;
  priority?: string;
}

class DesktopNotificationService {
  private router: Router | null = null;
  private baseTitle: string = typeof document !== 'undefined' ? document.title : 'Jenga POS';
  private originalFaviconHref: string = '/logo.svg';
  private navigationListenerInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Capture base title if set
      if (document.title && !document.title.startsWith('(')) {
        this.baseTitle = document.title;
      }
      // Capture default favicon
      const link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (link && link.href) {
        this.originalFaviconHref = link.getAttribute('href') || '/logo.svg';
      }
    }
  }

  /**
   * Links Vue Router for navigating when notifications are clicked
   */
  public setRouter(router: Router): void {
    this.router = router;

    // Listen for Electron navigation events when a native OS notification is clicked
    if (isElectron() && !this.navigationListenerInitialized) {
      this.navigationListenerInitialized = true;
      (window as any).ipcRenderer?.on('notification:navigate', (_: any, actionUrl: string) => {
        if (actionUrl && this.router) {
          if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://')) {
            window.open(actionUrl, '_blank');
          } else {
            this.router.push(actionUrl);
          }
        }
      });
    }
  }

  /**
   * Checks whether external notifications are supported in current environment
   */
  public isSupported(): boolean {
    if (isElectron()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Gets current notification permission status: 'granted' | 'denied' | 'default'
   */
  public getPermissionState(): 'granted' | 'denied' | 'default' {
    if (isElectron()) return 'granted';
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  /**
   * Requests permission from user (Web only; Electron is always granted)
   */
  public async requestPermission(): Promise<boolean> {
    if (isElectron()) return true;

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showNotification({
          title: 'DukaPro Desktop Alerts Active',
          message: 'You will now receive desktop notifications and unread badges on your computer.',
          priority: 'NORMAL'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[DesktopNotification] Permission request failed:', err);
      return false;
    }
  }

  /**
   * Displays an OS / Desktop notification outside the application window
   */
  public async showNotification(options: DesktopNotificationOptions): Promise<void> {
    if (!options.title) return;

    // 1. Electron Desktop Environment
    if (isElectron()) {
      try {
        await (window as any).ipcRenderer?.invoke('notification:show', {
          title: options.title,
          body: options.message,
          actionUrl: options.actionUrl
        });
      } catch (err) {
        console.warn('[DesktopNotification] Failed to invoke Electron native notification:', err);
      }
      return;
    }

    // 2. Web Browser Environment
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notifOptions: any = {
          body: options.message,
          icon: '/logo.svg',
          badge: '/logo.svg',
          tag: options.title, // Group/dedup similar notifications
          renotify: true
        };
        const notif = new Notification(options.title, notifOptions);

        notif.onclick = () => {
          window.focus();
          notif.close();
          if (options.actionUrl && this.router) {
            if (options.actionUrl.startsWith('http://') || options.actionUrl.startsWith('https://')) {
              window.open(options.actionUrl, '_blank');
            } else {
              this.router.push(options.actionUrl);
            }
          }
        };
      } catch (err) {
        console.warn('[DesktopNotification] Failed to create web Notification instance:', err);
      }
    }
  }

  /**
   * Generates a 32x32 crisp red badge image data URL for Windows taskbar overlay / dock
   */
  public createBadgeDataUrl(count: number): string {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Anti-aliased circular red badge
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#dc2626'; // Vibrant Red
    ctx.fill();

    // Clean white border
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Bold centered white text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = count > 99 ? '99+' : String(count);
    ctx.font = text.length >= 3 
      ? 'bold 11px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
      : 'bold 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(text, 16, 16.5);

    return canvas.toDataURL('image/png');
  }

  /**
   * Updates the notification badge outside the app:
   * - Electron: Windows Taskbar overlay icon, macOS Dock badge, Linux Unity counter
   * - Web: Browser App Badging API, Dynamic Favicon Badge, and Document Title count
   */
  public async updateBadge(count: number): Promise<void> {
    const numericCount = Math.max(0, Math.floor(count || 0));

    // A. Update Electron Taskbar / Dock
    if (isElectron()) {
      try {
        const dataUrl = numericCount > 0 ? this.createBadgeDataUrl(numericCount) : '';
        await (window as any).ipcRenderer?.invoke('badge:set-count', {
          count: numericCount,
          dataUrl
        });
      } catch (err) {
        console.warn('[DesktopNotification] Failed to set Electron badge:', err);
      }
    }

    // B. Update Web Environment (Tabs, PWA, Taskbar)
    if (typeof window !== 'undefined') {
      // 1. Web App Badging API (Chrome, Edge, PWA)
      if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
        try {
          if (numericCount > 0) {
            navigator.setAppBadge(numericCount).catch(() => {});
          } else {
            navigator.clearAppBadge?.().catch(() => {});
          }
        } catch {
          // Ignore badge API errors on unsupported platforms
        }
      }

      // 2. Document Title Badge (e.g. "(3) Jenga POS - Mfumo...")
      if (document.title) {
        const cleanTitle = document.title.replace(/^\(\d+\+?\)\s*/, '');
        if (cleanTitle) this.baseTitle = cleanTitle;
      }
      document.title = numericCount > 0 
        ? `(${numericCount > 99 ? '99+' : numericCount}) ${this.baseTitle}` 
        : this.baseTitle;

      // 3. Dynamic Favicon Badge
      this.updateFaviconBadge(numericCount);
    }
  }

  /**
   * Updates or restores the dynamic favicon with a red badge counter
   */
  private updateFaviconBadge(count: number): void {
    if (typeof document === 'undefined') return;

    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0]?.appendChild(link);
    }

    // If count is 0, restore the original clean SVG favicon
    if (count <= 0) {
      link.href = this.originalFaviconHref;
      return;
    }

    // Compose favicon + badge
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.originalFaviconHref;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base icon
      ctx.drawImage(img, 0, 0, 32, 32);

      // Draw red badge bubble at top-right
      const badgeRadius = 9;
      const badgeX = 23;
      const badgeY = 9;

      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // White count text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = count > 9 ? '9+' : String(count);
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText(text, badgeX, badgeY + 0.5);

      if (link) {
        link.href = canvas.toDataURL('image/png');
      }
    };
  }
}

export const desktopNotificationService = new DesktopNotificationService();
