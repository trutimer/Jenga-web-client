<template>
  <div v-if="isElectronApp" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-xs" :class="badgeClasses">
    <!-- Status Dot / Spinner -->
    <span v-if="syncState.isSyncing" class="relative flex h-2.5 w-2.5">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
    </span>
    <span v-else-if="syncState.isOnline && syncState.pendingCount === 0" class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
    <span v-else-if="syncState.isOnline && syncState.pendingCount > 0" class="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
    <span v-else class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>

    <!-- Status Text -->
    <span>{{ statusText }}</span>

    <!-- Sync Action Button -->
    <button 
      v-if="syncState.pendingCount > 0 && !syncState.isSyncing" 
      @click="triggerSync" 
      class="ml-1 px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 transition-colors text-[10px] font-bold uppercase tracking-wider"
      :title="$t('sync.syncTooltip')"
    >
      {{ $t('sync.syncNow') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { t } from '../i18n';

const isElectronApp = ref(typeof window !== 'undefined' && (window as any).ipcRenderer !== undefined);

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  totalCount: number;
  lastSyncTime: number;
}

const syncState = ref<SyncState>({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  totalCount: 0,
  lastSyncTime: Date.now()
});

const badgeClasses = computed(() => {
  if (syncState.value.isSyncing) {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
  }
  if (syncState.value.isOnline && syncState.value.pendingCount === 0) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (syncState.value.isOnline && syncState.value.pendingCount > 0) {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }
  return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
});

const statusText = computed(() => {
  if (syncState.value.isSyncing) {
    return t('sync.syncing', { count: syncState.value.pendingCount });
  }
  if (!syncState.value.isOnline) {
    return syncState.value.pendingCount > 0
      ? t('sync.offlineWithCount', { count: syncState.value.pendingCount })
      : t('sync.offlineMode');
  }
  if (syncState.value.pendingCount > 0) {
    return t('sync.pendingPush', { count: syncState.value.pendingCount });
  }
  return t('sync.synced');
});

function onStatusUpdate(_: any, data: SyncState) {
  if (data) {
    syncState.value = { ...syncState.value, ...data };
  }
}

async function triggerSync() {
  if (isElectronApp.value) {
    try {
      await (window as any).ipcRenderer.invoke('sync:trigger-now');
    } catch (err) {
      console.error('Failed to trigger sync:', err);
    }
  }
}

onMounted(async () => {
  if (isElectronApp.value) {
    (window as any).ipcRenderer.on('sync:status-changed', onStatusUpdate);
    try {
      const initial = await (window as any).ipcRenderer.invoke('sync:get-status');
      if (initial) {
        syncState.value.pendingCount = initial.pendingCount || 0;
      }
    } catch (err) {
      console.error('Failed to get initial sync status:', err);
    }
  }
});

onUnmounted(() => {
  if (isElectronApp.value && (window as any).ipcRenderer?.off) {
    (window as any).ipcRenderer.off('sync:status-changed', onStatusUpdate);
  }
});
</script>
