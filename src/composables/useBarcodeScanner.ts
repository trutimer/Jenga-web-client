import { ref, onMounted, onUnmounted } from 'vue';

export interface BarcodeScannerOptions {
  /** Maximum delay (ms) between consecutive keystrokes from a scanner (default: 40ms) */
  maxInterKeyTimeout?: number;
  /** Minimum length of a valid barcode string (default: 3) */
  minLength?: number;
  /** Whether to listen globally even if focusing input elements (default: false) */
  ignoreInputElements?: boolean;
  /** Callback fired when a valid barcode scan sequence is completed */
  onScan?: (barcode: string) => void;
  /** Play sound audio feedback automatically */
  enableAudioFeedback?: boolean;
}

/** Web Audio API synthetic POS feedback sounds */
export function playPOSSound(type: 'success' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      // High pitch short beep (1200Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else {
      // Double low pitch warning buzz (350Hz)
      const now = ctx.currentTime;
      [0, 0.1].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now + delay);
        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });
    }
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

export function useBarcodeScanner(options: BarcodeScannerOptions = {}) {
  const {
    maxInterKeyTimeout = 40,
    minLength = 3,
    ignoreInputElements = false,
    onScan,
    enableAudioFeedback = true,
  } = options;

  const lastKeyTime = ref<number>(0);
  const buffer = ref<string>('');
  const lastScannedBarcode = ref<string>('');
  const scanHistory = ref<Array<{ barcode: string; timestamp: Date; speedMs: number }>>([]);
  const isScanning = ref<boolean>(false);
  const lastActiveScanTime = ref<Date | null>(null);
  const hidConnectedDevicesCount = ref<number>(0);
  const isHidSupported = ref<boolean>(typeof navigator !== 'undefined' && 'hid' in (navigator as object));
  const scanStats = ref<{ lastScanDuration: number; characterCount: number }>({
    lastScanDuration: 0,
    characterCount: 0,
  });

  let startTime = 0;

  const getNavHid = () => {
    return (navigator as unknown as { hid?: { getDevices: () => Promise<unknown[]>; addEventListener: (t: string, fn: () => void) => void; removeEventListener: (t: string, fn: () => void) => void } }).hid;
  };

  // WebHID Connection listener if available
  const updateHidDeviceCount = async () => {
    const hid = getNavHid();
    if (hid) {
      try {
        const devices = await hid.getDevices();
        hidConnectedDevicesCount.value = devices.length;
      } catch {
        // Ignored
      }
    }
  };

  const handleHidConnect = () => {
    updateHidDeviceCount();
  };

  const handleHidDisconnect = () => {
    updateHidDeviceCount();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const isInputElement =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    if (isInputElement && ignoreInputElements) {
      return;
    }

    const currentTime = performance.now();
    const timeDiff = currentTime - lastKeyTime.value;
    lastKeyTime.value = currentTime;

    // Reset buffer if delay between keystrokes is too long
    if (timeDiff > maxInterKeyTimeout && event.key !== 'Enter' && event.key !== 'Tab') {
      buffer.value = '';
      startTime = currentTime;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      if (buffer.value.length >= minLength) {
        const scanDuration = Math.round(currentTime - startTime);
        const scannedCode = buffer.value.trim();

        if (scannedCode) {
          lastScannedBarcode.value = scannedCode;
          lastActiveScanTime.value = new Date();
          scanStats.value = {
            lastScanDuration: scanDuration,
            characterCount: scannedCode.length,
          };
          scanHistory.value.unshift({
            barcode: scannedCode,
            timestamp: new Date(),
            speedMs: scanDuration,
          });
          if (scanHistory.value.length > 20) scanHistory.value.pop();

          if (enableAudioFeedback) {
            playPOSSound('success');
          }

          if (onScan) {
            onScan(scannedCode);
          }
        }
      }
      buffer.value = '';
      isScanning.value = false;
      return;
    }

    if (event.key.length === 1) {
      if (buffer.value.length === 0) {
        startTime = currentTime;
      }
      buffer.value += event.key;
      isScanning.value = true;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    const hid = getNavHid();
    if (hid) {
      hid.addEventListener('connect', handleHidConnect);
      hid.addEventListener('disconnect', handleHidDisconnect);
      updateHidDeviceCount();
    }
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    const hid = getNavHid();
    if (hid) {
      hid.removeEventListener('connect', handleHidConnect);
      hid.removeEventListener('disconnect', handleHidDisconnect);
    }
  });

  return {
    lastScannedBarcode,
    scanHistory,
    isScanning,
    scanStats,
    lastActiveScanTime,
    hidConnectedDevicesCount,
    isHidSupported,
    playPOSSound,
  };
}
