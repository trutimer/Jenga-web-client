<template>
  <div v-if="!isElectron()" class="turnstile-container flex justify-center items-center w-full min-h-[65px] my-2">
    <div ref="containerRef" class="w-full flex justify-center"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { isElectron } from '../../services/offlineSalesService';

const props = withDefaults(
  defineProps<{
    siteKey?: string;
    action?: string;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact' | 'flexible';
  }>(),
  {
    siteKey: () => (import.meta.env.VITE_TURNSTILE_SITEKEY as string) || '0x4AAAAAAEglhHD6Zy9Hik7e',
    action: 'login',
    theme: 'auto',
    size: 'normal',
  }
);

const emit = defineEmits<{
  (e: 'success', token: string): void;
  (e: 'expire'): void;
  (e: 'error', error: any): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
let widgetId: string | null = null;

const resolveSiteKey = (): string => {
  const envKey = import.meta.env.VITE_TURNSTILE_SITEKEY as string;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  return props.siteKey || '0x4AAAAAAEglhHD6Zy9Hik7e';
};

const renderWidget = () => {
  if (isElectron() || !containerRef.value) return;

  const turnstile = (window as any).turnstile;
  if (!turnstile || typeof turnstile.render !== 'function') {
    // If Turnstile script is still loading, wait a moment and retry
    setTimeout(renderWidget, 100);
    return;
  }

  // If already rendered, remove first
  if (widgetId) {
    try {
      turnstile.remove(widgetId);
    } catch (_) {}
    widgetId = null;
  }
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }

  try {
    const activeKey = resolveSiteKey();
    widgetId = turnstile.render(containerRef.value, {
      sitekey: activeKey,
      action: props.action,
      theme: props.theme,
      size: props.size,
      retry: 'auto',
      'retry-interval': 3000,
      'refresh-expired': 'auto',
      callback: (token: string) => {
        emit('success', token);
      },
      'expired-callback': () => {
        emit('expire');
      },
      'timeout-callback': () => {
        console.warn('[Cloudflare Turnstile] Challenge timeout received, auto-resetting...');
        emit('expire');
        reset();
      },
      'error-callback': (err: any) => {
        console.warn('[Cloudflare Turnstile] Verification error callback received:', err);
        emit('error', err);
      },
    });
  } catch (err) {
    console.error('Failed to render Cloudflare Turnstile widget:', err);
    emit('error', err);
  }
};

const reset = () => {
  const turnstile = (window as any).turnstile;
  if (turnstile && widgetId) {
    try {
      turnstile.reset(widgetId);
    } catch (err) {
      console.warn('Failed to reset Turnstile widget, re-rendering instead:', err);
      renderWidget();
    }
  } else {
    renderWidget();
  }
};

const getResponse = (): string | null => {
  const turnstile = (window as any).turnstile;
  if (turnstile && widgetId) {
    return turnstile.getResponse(widgetId);
  }
  return null;
};

watch(
  () => [props.siteKey, props.action, props.theme],
  () => {
    renderWidget();
  }
);

onMounted(() => {
  renderWidget();
});

onBeforeUnmount(() => {
  const turnstile = (window as any).turnstile;
  if (turnstile && widgetId) {
    try {
      turnstile.remove(widgetId);
    } catch (_) {}
  }
});

defineExpose({
  reset,
  getResponse,
});
</script>

<style scoped>
.turnstile-container {
  overflow: hidden;
}
</style>
