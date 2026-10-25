import { ref } from 'vue';

export const isZoomActive = ref(false);
export const zoomStage = ref<'origin' | 'expanded' | 'outro'>('origin');
export const zoomLabel = ref('JENGA');
export const zoomSublabel = ref('Welcome to DukaPro');
export const zoomClipPath = ref('');
export const zoomTransform = ref('scale(1)');
export const zoomOpacity = ref(1);
export const isTwoFactorPrompt = ref(false);

export interface LoginZoomOptions {
  label?: string;
  sublabel?: string;
  isTwoFactor?: boolean;
  onMidpoint?: () => void | Promise<void>;
}

export const triggerLoginZoom = async (
  btn: HTMLElement | null,
  options: LoginZoomOptions = {}
): Promise<void> => {
  const rect = btn?.getBoundingClientRect() || {
    top: window.innerHeight / 2 - 28,
    left: Math.max(16, window.innerWidth / 2 - 180),
    width: Math.min(360, window.innerWidth - 32),
    height: 56,
    right: Math.min(window.innerWidth - 16, window.innerWidth / 2 + 180),
    bottom: window.innerHeight / 2 + 28
  };

  zoomLabel.value = options.label || 'Signing in...';
  zoomSublabel.value = options.sublabel || 'Welcome to DukaPro';
  isTwoFactorPrompt.value = !!options.isTwoFactor;
  zoomStage.value = 'origin';

  // 1. Initial State: Clamped precisely to the button rect with 12px rounded corners
  zoomClipPath.value = `inset(${rect.top}px calc(100vw - ${rect.right}px) calc(100vh - ${rect.bottom}px) ${rect.left}px round 12px)`;
  zoomTransform.value = 'scale(1)';
  zoomOpacity.value = 1;
  isZoomActive.value = true;

  // 2. Hardware-accelerated Zoom In (GPU clip-path expansion)
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        zoomStage.value = 'expanded';
        zoomClipPath.value = 'inset(0px 0px 0px 0px round 0px)';
        setTimeout(resolve, 380);
      });
    });
  });

  // 3. Midpoint execution: Screen is 100% solid Jenga Orange!
  if (options.onMidpoint) {
    await options.onMidpoint();
  }

  // Brief pause for browser layout/mount
  await new Promise((r) => setTimeout(r, 60));

  // 4. Zoom Out / Outro Reveal: Orange curtain smoothly scales up and dissolves
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      zoomStage.value = 'outro';
      zoomTransform.value = 'scale(1.18)';
      zoomOpacity.value = 0;
      setTimeout(() => {
        isZoomActive.value = false;
        zoomStage.value = 'origin';
        zoomTransform.value = 'scale(1)';
        zoomClipPath.value = '';
        zoomOpacity.value = 1;
        resolve();
      }, 400);
    });
  });
};
