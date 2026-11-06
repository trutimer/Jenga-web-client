<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-4 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-4 opacity-0 scale-95"
  >
    <aside
      v-if="isUpdateAvailable && !isDismissed && !isElectronEnvironment()"
      aria-label="Application update notification"
      class="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:bottom-6 z-50 pointer-events-auto"
    >
      <div
        class="bg-slate-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-md rounded-2xl p-3 md:px-4 md:py-3.5 shadow-2xl border border-white/15 flex items-center justify-between gap-3 md:gap-4 max-w-md w-full"
      >
        <!-- Icon & Message -->
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0"
          >
            <RefreshCw class="w-4.5 h-4.5 animate-spin [animation-duration:5s]" />
          </div>

          <div class="min-w-0">
            <div class="text-xs font-black tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>{{ $t('topNav.webUpdateTitle') || 'Update Available' }}</span>
              <span
                v-if="newVersionString"
                class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-white shrink-0"
              >
                {{ newVersionString }}
              </span>
            </div>
            <p class="text-[11px] text-white/70 font-medium leading-tight mt-0.5 truncate">
              {{ $t('topNav.webUpdateDesc') || 'A new version of Jenga is ready.' }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="reloadToUpdate"
            class="px-3.5 py-1.5 bg-primary hover:bg-primary/90 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer flex items-center gap-1.5"
          >
            <span>{{ $t('topNav.webUpdateReload') || 'Reload' }}</span>
            <ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            @click="dismissUpdateBanner"
            :title="$t('topNav.webUpdateDismiss') || 'Later'"
            class="p-1 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { RefreshCw, ArrowRight, X } from 'lucide-vue-next';
import {
  isUpdateAvailable,
  newVersionString,
  isDismissed,
  isElectronEnvironment,
  reloadToUpdate,
  dismissUpdateBanner,
} from '../../services/webUpdateService';
</script>
