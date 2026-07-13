<template>
  <div 
    v-if="message" 
    class="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0" 
    :class="type === 'success' 
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-slide-in' 
      : 'bg-rose-50 text-rose-800 border-rose-200 animate-slide-in'"
  >
    <Check v-if="type === 'success'" class="w-5 h-5 shrink-0 text-emerald-600" />
    <AlertCircle v-else class="w-5 h-5 shrink-0 text-rose-600" />
    <span class="text-sm font-semibold">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { Check, AlertCircle } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  message: string | null;
  type?: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}>(), {
  type: 'success',
  duration: 3005
});

let timer: any = null;

const startTimer = () => {
  if (timer) clearTimeout(timer);
  if (!props.message) return;
  timer = setTimeout(() => {
    props.onClose();
  }, props.duration);
};

watch(() => props.message, startTimer, { immediate: true });

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>
