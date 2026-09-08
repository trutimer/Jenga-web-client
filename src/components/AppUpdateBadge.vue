<template>
  <div v-if="isElectronApp && isVisible" class="inline-flex items-center">
    <!-- Downloading Progress Pill -->
    <div 
      v-if="updateState.status === 'downloading'"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 shadow-xs animate-pulse"
      :title="`Downloading Jenga update v${updateState.latestVersion || ''} (${updateState.downloadProgress || 0}%)`"
    >
      <ArrowDownCircle class="w-3.5 h-3.5 animate-bounce text-blue-600 dark:text-blue-400" />
      <span>{{ $t('updater.downloading', { percent: updateState.downloadProgress || 0 }) }}</span>
      <span v-if="speedFormatted" class="text-[10px] opacity-75 font-mono">({{ speedFormatted }})</span>
    </div>

    <!-- Update Downloaded / Ready to Restart Button -->
    <button
      v-else-if="updateState.status === 'downloaded'"
      @click="showRestartModal = true"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500 animate-zoom-pulse"
      :title="$t('updater.restartToUpdate')"
    >
      <Sparkles class="w-3.5 h-3.5" />
      <span>{{ $t('updater.updateReady', { version: updateState.latestVersion || '' }) }}</span>
      <RefreshCw class="w-3 h-3 ml-0.5" />
    </button>

    <!-- Update Confirmation Modal -->
    <Modal
      :isOpen="showRestartModal"
      :onClose="() => (showRestartModal = false)"
      :title="$t('updater.restartModalTitle')"
      maxWidth="max-w-md"
    >
      <div class="flex flex-col items-center text-center gap-4 py-3">
        <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Sparkles class="w-7 h-7" />
        </div>

        <div class="space-y-1">
          <h4 class="text-lg font-black text-on-surface">
            {{ $t('updater.restartModalTitle') }}
          </h4>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            {{ $t('updater.restartModalDesc', { version: updateState.latestVersion || '' }) }}
          </p>
        </div>

        <!-- Version Comparison Badge -->
        <div class="w-full bg-surface-container-low rounded-xl p-3 border border-outline-variant/60 flex items-center justify-around font-mono text-xs">
          <div class="flex flex-col items-center">
            <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{{ $t('updater.currentVersion') }}</span>
            <span class="font-bold text-on-surface mt-0.5">v{{ updateState.currentVersion }}</span>
          </div>
          <div class="text-on-surface-variant font-bold">➔</div>
          <div class="flex flex-col items-center">
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">New Version</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">v{{ updateState.latestVersion }}</span>
          </div>
        </div>

        <!-- Optional Release Notes snippet -->
        <div v-if="updateState.releaseNotes" class="w-full text-left bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40 text-[11px] text-on-surface-variant">
          <span class="font-bold block mb-1 text-on-surface">{{ $t('updater.releaseNotes') }}:</span>
          <p class="whitespace-pre-line">{{ updateState.releaseNotes }}</p>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showRestartModal = false"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
        >
          {{ $t('updater.later') }}
        </button>
        <button
          type="button"
          @click="applyUpdateAndRestart"
          :disabled="isRestarting"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="isRestarting ? 'animate-spin' : ''" />
          <span>{{ isRestarting ? 'Restarting...' : $t('updater.restartNow') }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ArrowDownCircle, Sparkles, RefreshCw } from 'lucide-vue-next';
import Modal from './common/Modal.vue';
import { showToast } from '../services/toastService';
import { t } from '../i18n';

interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error';
  currentVersion: string;
  latestVersion?: string;
  downloadProgress?: number;
  downloadSpeed?: number;
  downloadedBytes?: number;
  totalBytes?: number;
  releaseNotes?: string;
  error?: string;
}

const isElectronApp = ref(typeof window !== 'undefined' && (window as any).ipcRenderer !== undefined);
const showRestartModal = ref(false);
const isRestarting = ref(false);

const updateState = ref<UpdateState>({
  status: 'idle',
  currentVersion: '2.6.0',
});

const isVisible = computed(() => {
  return updateState.value.status === 'downloading' || updateState.value.status === 'downloaded';
});

const speedFormatted = computed(() => {
  const speed = updateState.value.downloadSpeed;
  if (!speed || speed <= 0) return '';
  if (speed > 1024 * 1024) {
    return `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
  }
  return `${Math.round(speed / 1024)} KB/s`;
});

function onStatusUpdate(_: any, data: UpdateState) {
  if (data) {
    const previousStatus = updateState.value.status;
    updateState.value = { ...updateState.value, ...data };

    // When status transitions to downloaded, show toast notification
    if (previousStatus !== 'downloaded' && data.status === 'downloaded') {
      showToast(
        t('updater.updateReady', { version: data.latestVersion || '' }) + ' - ' + t('updater.restartToUpdate'),
        'success'
      );
    }
  }
}

async function applyUpdateAndRestart() {
  if (!isElectronApp.value) return;
  isRestarting.value = true;
  try {
    const res = await (window as any).ipcRenderer.invoke('updater:restart-and-install');
    if (res && res.success && res.message) {
      showToast(res.message, 'info');
      showRestartModal.value = false;
      isRestarting.value = false;
    }
  } catch (err: any) {
    console.error('Failed to restart and install update:', err);
    showToast(err?.message || t('updater.updateFailed'), 'error');
    isRestarting.value = false;
  }
}

onMounted(async () => {
  if (isElectronApp.value) {
    (window as any).ipcRenderer.on('updater:status-changed', onStatusUpdate);
    try {
      const initial = await (window as any).ipcRenderer.invoke('updater:get-status');
      if (initial) {
        updateState.value = { ...updateState.value, ...initial };
      }
    } catch (err) {
      console.error('Failed to fetch initial update status:', err);
    }
  }
});

onUnmounted(() => {
  if (isElectronApp.value && (window as any).ipcRenderer?.off) {
    (window as any).ipcRenderer.off('updater:status-changed', onStatusUpdate);
  }
});
</script>
