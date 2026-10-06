<template>
  <Modal 
    :isOpen="isOpen" 
    :title="$t('topNav.downloadAppTitle')" 
    :onClose="onClose"
    maxWidth="max-w-lg"
  >
    <div class="flex flex-col items-center text-center gap-4 py-2">
      <!-- App Icon Header -->
      <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
        <Download class="w-8 h-8 text-primary" />
      </div>

      <!-- Header Titles -->
      <div class="flex flex-col items-center">
        <!-- Detection Pill -->
        <div 
          v-if="detectedPlatform"
          class="inline-flex items-center gap-1.5 px-3 py-0.5 mb-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{{ $t('topNav.detectedPlatform') }}: <strong class="font-semibold text-on-surface">{{ detectedPlatform === 'mac' ? 'macOS' : 'Windows' }}</strong></span>
        </div>

        <h3 class="text-xl font-black text-on-surface tracking-tight">{{ $t('topNav.downloadAppHeader') }}</h3>
        <p class="text-xs text-on-surface-variant leading-relaxed max-w-sm mx-auto mt-1">
          {{ $t('topNav.downloadAppDesc') }}
        </p>
      </div>

      <!-- Platform Selection Cards -->
      <div class="w-full grid grid-cols-2 gap-3 mt-1 text-left">
        <!-- Windows Option Card -->
        <button
          type="button"
          @click="selectedPlatform = 'windows'"
          class="relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left group"
          :class="selectedPlatform === 'windows' 
            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/30' 
            : 'border-outline-variant/60 bg-surface-container hover:border-outline hover:bg-surface-container-high'"
        >
          <!-- Recommended Badge -->
          <span 
            v-if="detectedPlatform === 'windows'"
            class="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-on-primary shadow-xs"
          >
            {{ $t('topNav.recommended') }}
          </span>

          <div class="flex items-start justify-between w-full">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              :class="selectedPlatform === 'windows' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-high text-on-surface-variant group-hover:text-primary'">
              <Monitor class="w-5 h-5" />
            </div>
            
            <!-- Radio / Check indicator -->
            <div class="w-5 h-5 rounded-full flex items-center justify-center border transition-all"
              :class="selectedPlatform === 'windows' ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-surface'">
              <Check v-if="selectedPlatform === 'windows'" class="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div>
            <div class="font-black text-sm text-on-surface flex items-center gap-1.5">
              <span>{{ $t('topNav.windowsTitle') || 'Windows' }}</span>
            </div>
            <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">
              {{ $t('topNav.windowsDesc') }}
            </p>
          </div>
        </button>

        <!-- macOS Option Card -->
        <button
          type="button"
          @click="selectedPlatform = 'mac'"
          class="relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left group"
          :class="selectedPlatform === 'mac' 
            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/30' 
            : 'border-outline-variant/60 bg-surface-container hover:border-outline hover:bg-surface-container-high'"
        >
          <!-- Recommended Badge -->
          <span 
            v-if="detectedPlatform === 'mac'"
            class="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-on-primary shadow-xs"
          >
            {{ $t('topNav.recommended') }}
          </span>

          <div class="flex items-start justify-between w-full">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              :class="selectedPlatform === 'mac' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-high text-on-surface-variant group-hover:text-primary'">
              <Apple class="w-5 h-5" />
            </div>
            
            <!-- Radio / Check indicator -->
            <div class="w-5 h-5 rounded-full flex items-center justify-center border transition-all"
              :class="selectedPlatform === 'mac' ? 'border-primary bg-primary text-white' : 'border-outline-variant bg-surface'">
              <Check v-if="selectedPlatform === 'mac'" class="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div>
            <div class="font-black text-sm text-on-surface flex items-center gap-1.5">
              <span>{{ $t('topNav.macTitle') || 'macOS' }}</span>
            </div>
            <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">
              {{ $t('topNav.macDesc') }}
            </p>
          </div>
        </button>
      </div>

      <!-- Specs & Version Card -->
      <div class="bg-surface-container-low w-full rounded-2xl p-3.5 border border-outline-variant/60 text-left font-mono text-xs space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">{{ $t('topNav.currentVersion') }}</span>
          <span class="text-primary font-bold">v3.0.0 ({{ $t('topNav.latestRelease') }})</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-outline-variant/40">
          <span class="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">{{ $t('topNav.platform') }}</span>
          <span class="text-on-surface font-semibold">
            {{ selectedPlatform === 'mac' ? $t('topNav.macPlatform') : $t('topNav.windowsPlatform') }}
          </span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-outline-variant/40">
          <span class="text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">{{ $t('topNav.systemCompatibility') }}</span>
          <span class="text-on-surface-variant text-[11px]">
            {{ selectedPlatform === 'mac' ? $t('topNav.macCompat') : $t('topNav.windowsCompat') }}
          </span>
        </div>
      </div>

      <!-- Main Download Action Button -->
      <a 
        :href="activeDownloadUrl"
        :download="activeFilename"
        @click="onClose"
        class="w-full mt-1 bg-primary text-on-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-primary/25 border border-primary/40"
      >
        <Download class="w-5 h-5 stroke-[2.5]" />
        <span>
          {{ selectedPlatform === 'mac' ? $t('topNav.downloadForMac') : $t('topNav.downloadForWindows') }}
        </span>
      </a>

      <!-- Quick Toggle Helper Link -->
      <button
        type="button"
        @click="selectedPlatform = selectedPlatform === 'windows' ? 'mac' : 'windows'"
        class="text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer font-medium flex items-center gap-1.5 underline underline-offset-4 decoration-outline-variant hover:decoration-primary"
      >
        <Laptop class="w-3.5 h-3.5" />
        <span>
          {{ selectedPlatform === 'windows' ? $t('topNav.switchToMac') : $t('topNav.switchToWindows') }}
        </span>
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Modal from './Modal.vue';
import { Download, Monitor, Apple, Check, Laptop } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  onClose: () => void;
}>();

type Platform = 'windows' | 'mac';

const detectedPlatform = ref<Platform>('windows');
const selectedPlatform = ref<Platform>('windows');

const detectPlatform = () => {
  if (typeof window === 'undefined') return;
  const userAgent = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
  const isMac = /mac/i.test(platform) || /macintosh|mac os x/i.test(userAgent);

  detectedPlatform.value = isMac ? 'mac' : 'windows';
  selectedPlatform.value = detectedPlatform.value;
};

onMounted(() => {
  detectPlatform();
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    detectPlatform();
  }
});

const windowsDownloadUrl = computed(() => {
  return (
    (import.meta.env.VITE_DESKTOP_WINDOWS_DOWNLOAD_URL as string) ||
    (import.meta.env.VITE_DESKTOP_DOWNLOAD_URL as string) ||
    '/Jenga-Setup-Latest.exe'
  );
});

const macDownloadUrl = computed(() => {
  return (
    (import.meta.env.VITE_DESKTOP_MAC_DOWNLOAD_URL as string) ||
    '/Jenga-Latest.dmg'
  );
});

const activeDownloadUrl = computed(() => {
  return selectedPlatform.value === 'mac' ? macDownloadUrl.value : windowsDownloadUrl.value;
});

const activeFilename = computed(() => {
  return selectedPlatform.value === 'mac' ? 'Jenga-Latest.dmg' : 'Jenga-Setup-Latest.exe';
});
</script>
