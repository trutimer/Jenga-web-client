<template>
  <!-- Buttons Variant (e.g. For Login / Settings) -->
  <div v-if="variant === 'buttons'" class="inline-flex items-center p-1 bg-surface-container rounded-xl border border-outline-variant/60 shadow-inner font-sans">
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      type="button"
      @click="setLocale(loc.code)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
      :class="currentLocale === loc.code 
        ? 'bg-primary text-on-primary shadow-xs' 
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high bg-transparent'"
    >
      <span class="text-sm leading-none">{{ loc.flag }}</span>
      <span>{{ loc.code === 'sw' ? loc.nativeLabel : loc.label }}</span>
    </button>
  </div>

  <!-- Dropdown Variant (e.g. For TopNav / Headers) -->
  <div v-else class="relative font-sans" ref="dropdownRef">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 h-9 rounded-xl border border-outline-variant/70 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-all cursor-pointer shadow-xs"
      :title="`Current language: ${activeLocaleObj.label}`"
    >
      <span class="text-sm leading-none">{{ activeLocaleObj.flag }}</span>
      <span class="hidden sm:inline">{{ activeLocaleObj.code === 'sw' ? 'Kiswahili' : 'English' }}</span>
      <ChevronDown class="w-3.5 h-3.5 text-on-surface-variant transition-transform" :class="isOpen ? 'rotate-180' : ''" />
    </button>

    <!-- Backdrop -->
    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-40"></div>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-1.5 w-48 bg-surface rounded-2xl border border-outline-variant shadow-2xl p-1.5 z-50 flex flex-col gap-1 animate-fade-down"
    >
      <div class="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-outline-variant/30">
        {{ $t('language.selectLanguage') }}
      </div>

      <button
        v-for="loc in availableLocales"
        :key="loc.code"
        type="button"
        @click="selectLang(loc.code)"
        class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border-0"
        :class="currentLocale === loc.code 
          ? 'bg-primary-container text-on-primary-container font-bold' 
          : 'text-on-surface hover:bg-surface-container-high bg-transparent'"
      >
        <div class="flex items-center gap-2">
          <span class="text-base leading-none">{{ loc.flag }}</span>
          <span>{{ loc.nativeLabel }}</span>
        </div>
        <Check v-if="currentLocale === loc.code" class="w-4 h-4 text-primary" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../i18n';
import type { Locale, LocaleOption } from '../../i18n/types';
import { ChevronDown, Check } from 'lucide-vue-next';

withDefaults(defineProps<{
  variant?: 'buttons' | 'dropdown';
}>(), {
  variant: 'dropdown',
});

const { currentLocale, setLocale, availableLocales } = useI18n();

const isOpen = ref(false);

const activeLocaleObj = computed<LocaleOption>(() => {
  return availableLocales.find(l => l.code === currentLocale.value) || {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧'
  };
});

const selectLang = (code: Locale) => {
  setLocale(code);
  isOpen.value = false;
};
</script>
