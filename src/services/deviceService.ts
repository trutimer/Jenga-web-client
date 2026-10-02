import { isElectron } from './offlineSalesService';
import { api } from './api';

export interface DeviceMetadata {
  deviceId: string;
  deviceType: 'DESKTOP';
  osName: string;
  osVersion: string;
  deviceModel: string;
  deviceManufacturer: string;
  appVersion: string;
  appBuildNumber?: string;
  fcmToken?: string;
  confirmDeviceTransfer: boolean;
}

export function isDesktopApp(): boolean {
  return isElectron();
}

export function getOrCreateDeviceId(): string | null {
  // Web browser version strictly does not use or store device ID
  if (!isElectron()) {
    try {
      localStorage.removeItem('deviceId');
    } catch (_) {}
    return null;
  }

  let id = localStorage.getItem('deviceId');
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem('deviceId', id);
  }
  return id;
}

/**
 * Returns desktop device metadata for Electron POS terminals.
 * For Web browser version, returns null because WEB is exempted from device enforcing.
 */
export function getDesktopDeviceMetadata(
  confirmTransfer: boolean = false,
  hardwareFingerprint?: string | null
): DeviceMetadata | null {
  if (!isElectron()) {
    return null;
  }

  const deviceId = (hardwareFingerprint && hardwareFingerprint.trim() !== '')
    ? hardwareFingerprint.trim()
    : (getOrCreateDeviceId() || 'DESKTOP-POS');

  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
  let osName = 'Windows';
  let deviceManufacturer = 'PC';

  if (ua.includes('Win')) {
    osName = 'Windows';
    deviceManufacturer = 'PC';
  } else if (ua.includes('Mac')) {
    osName = 'macOS';
    deviceManufacturer = 'Apple';
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
    deviceManufacturer = 'PC';
  } else {
    osName = 'Desktop';
    deviceManufacturer = 'Desktop PC';
  }

  const deviceModel = `Jenga POS Desktop (${osName})`;
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.8.0';

  return {
    deviceId,
    deviceType: 'DESKTOP',
    osName,
    osVersion: (navigator as any)?.userAgentData?.platform || navigator.platform || '1.0',
    deviceModel,
    deviceManufacturer,
    appVersion,
    appBuildNumber: '1',
    confirmDeviceTransfer: confirmTransfer
  };
}

// Backwards-compatible alias for existing imports
export const getClientDeviceMetadata = getDesktopDeviceMetadata;

export function clearAuthStorage(): void {
  const deviceId = isElectron() ? localStorage.getItem('deviceId') : null;
  const lastPhone = localStorage.getItem('lastPhone');
  localStorage.clear();
  sessionStorage.clear();
  if (isElectron() && deviceId) {
    localStorage.setItem('deviceId', deviceId);
  }
  if (lastPhone) {
    localStorage.setItem('lastPhone', lastPhone);
  }
}

export async function deregisterCurrentDevice(): Promise<void> {
  // Web version does not register personal devices
  if (!isElectron()) {
    return;
  }
  try {
    await api.post('/api/devices/current/deregister', {}, { suppressToast: true });
  } catch (err) {
    console.warn('Failed to deregister current device:', err);
  }
}
