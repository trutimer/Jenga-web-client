<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
    <!-- Overlay background -->
    <div 
      @click="onClose"
      class="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300"
    />

    <!-- Dialog Container -->
    <div class="relative w-full bg-surface rounded-2xl border border-outline-variant shadow-2xl overflow-hidden animate-scale-in" :class="maxWidth">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div>
          <h3 class="text-lg font-black text-primary">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-on-surface-variant mt-0.5">{{ subtitle }}</p>
        </div>
        <button
          @click="onClose"
          class="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-all cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content Body -->
      <div class="p-6 max-h-[70vh] overflow-y-auto">
        <slot />
      </div>

      <!-- Footer if slot is provided -->
      <div v-if="$slots.footer" class="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-3.5">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

withDefaults(defineProps<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
}>(), {
  maxWidth: 'max-w-lg'
});
</script>
