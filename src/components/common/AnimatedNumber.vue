<template>
  <span 
    class="inline-block tabular-nums transition-colors duration-300"
    :class="pulseClass"
  >
    {{ formattedText }}
  </span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { formatCurrency } from '@/models/mockData';

const props = withDefaults(defineProps<{
  value: number;
  currency?: string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (val: number) => string;
}>(), {
  currency: '',
  duration: 750,
  decimals: 0,
  prefix: '',
  suffix: ''
});

const displayValue = ref<number>(Number(props.value) || 0);
const pulseClass = ref<string>('');
let animationFrameId: number | null = null;
let pulseTimer: any = null;

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const animateTo = (start: number, end: number, dur: number) => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (start === end || dur <= 0) {
    displayValue.value = end;
    return;
  }

  if (end > start) {
    pulseClass.value = 'text-emerald-500 scale-[1.02]';
  } else if (end < start) {
    pulseClass.value = 'text-rose-500 scale-[0.98]';
  }

  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    pulseClass.value = '';
  }, dur + 250);

  const startTime = performance.now();

  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / dur, 1);
    const eased = easeOutExpo(progress);

    displayValue.value = start + (end - start) * eased;

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(tick);
    } else {
      displayValue.value = end;
      animationFrameId = null;
    }
  };

  animationFrameId = requestAnimationFrame(tick);
};

watch(() => props.value, (newVal, oldVal) => {
  const start = typeof oldVal === 'number' && !isNaN(oldVal) ? oldVal : displayValue.value;
  const end = typeof newVal === 'number' && !isNaN(newVal) ? newVal : 0;
  animateTo(start, end, props.duration);
});

onMounted(() => {
  displayValue.value = Number(props.value) || 0;
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  if (pulseTimer) clearTimeout(pulseTimer);
});

const formattedText = computed(() => {
  const current = displayValue.value;
  let formatted = '';
  if (props.format) {
    formatted = props.format(current);
  } else if (props.currency) {
    formatted = formatCurrency(Math.round(current), props.currency as 'TZS' | 'USD' | 'EUR');
  } else {
    formatted = current.toLocaleString('en-US', {
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals
    });
  }
  return `${props.prefix}${formatted}${props.suffix}`;
});
</script>
