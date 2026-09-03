<template>
  <Modal 
    :isOpen="isOpen" 
    :title="$t('license.renewalNoticeTitle')" 
    :subtitle="$t('license.renewalSubtitle')"
    :onClose="onClose"
    maxWidth="max-w-md"
  >
    <div class="space-y-6 text-center font-sans py-2">
      <!-- Animated Warning Icon -->
      <div class="relative w-20 h-20 bg-error-container/30 text-error rounded-full flex items-center justify-center mx-auto shadow-inner">
        <div class="absolute inset-0 rounded-full bg-error/20 animate-ping pointer-events-none" />
        <Clock class="w-10 h-10 stroke-[2px] relative z-10" />
      </div>

      <!-- Days Countdown Card -->
      <div class="bg-gradient-to-br from-error-container/30 to-surface-container-low border border-error/30 rounded-2xl p-5 shadow-sm space-y-2">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-error">
          {{ $t('license.countdownTitle') }}
        </span>
        <div class="text-4xl font-black text-error tracking-tight flex items-center justify-center gap-2">
          <span>{{ daysLeft <= 0 ? $t('license.expiredBadge') : $t('license.daysCountdown', { days: daysLeft }) }}</span>
        </div>
        <p class="text-xs text-on-surface-variant font-mono">
          {{ $t('license.validUntil') }}: <span class="font-bold text-on-surface">{{ formatDate(expiresAt) }}</span>
        </p>
      </div>

      <!-- Impact Notice Box -->
      <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 text-left text-xs space-y-2 leading-relaxed">
        <div class="flex items-center gap-2 text-error font-bold">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span>{{ $t('license.disruptionWarning') }}</span>
        </div>
        <p class="text-on-surface-variant">
          {{ $t('license.disruptionDesc', { date: formatDate(expiresAt) }) }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex flex-col sm:flex-row items-center gap-2">
        <button 
          @click="onClose"
          class="w-full sm:w-1/2 py-2.5 bg-surface-container-high text-on-surface font-bold text-xs rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer"
        >
          {{ $t('license.remindLater') }}
        </button>
        <button 
          @click="onViewDetails"
          class="w-full sm:w-1/2 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
        >
          <ShieldCheck class="w-4 h-4" />
          <span>{{ $t('license.viewLicenseDetails') }}</span>
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  daysLeft: number;
  expiresAt?: string;
}>();

const formatDate = (isoStr?: string) => {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return isoStr;
  }
};
</script>
