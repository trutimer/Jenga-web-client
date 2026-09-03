<template>
  <div class="turnstile-container flex justify-center items-center w-full min-h-[65px] my-2">
    <div ref="containerRef" class="w-full flex justify-center"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

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

const renderWidget = () => {
  if (!containerRef.value) return;

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

  try {
    widgetId = turnstile.render(containerRef.value, {
      sitekey: props.siteKey,
      action: props.action,
      theme: props.theme,
      size: props.size,
      callback: (token: string) => {
        emit('success', token);
      },
      'expired-callback': () => {
        emit('expire');
      },
      'error-callback': (err: any) => {
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
