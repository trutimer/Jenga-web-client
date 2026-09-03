import { ref, computed, type App } from 'vue';
import type { Locale, LocaleOption, TranslationParams } from './types';
import { en } from './locales/en';
import { sw } from './locales/sw';

const STORAGE_KEY = 'app_language';

const initialLocale: Locale = (() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'sw' || saved === 'en') {
      return saved;
    }
  }
  return 'en';
})();

export const currentLocale = ref<Locale>(initialLocale);

export const availableLocales: LocaleOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', flag: '🇹🇿' },
];

const dictionaries: Record<Locale, any> = {
  en,
  sw,
};

function resolvePath(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const segments = path.split('.');
  let current = obj;
  for (const seg of segments) {
    if (current && typeof current === 'object' && seg in current) {
      current = current[seg];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function formatFallback(raw: string): string {
  if (!raw) return '';
  // Convert camelCase (e.g. 'financialStatements' -> 'Financial Statements')
  const withSpaces = raw.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export function t(path: string, params?: TranslationParams): string {
  const activeDict = dictionaries[currentLocale.value] || dictionaries.en;
  let translated = resolvePath(activeDict, path);

  if (translated === undefined && currentLocale.value !== 'en') {
    translated = resolvePath(dictionaries.en, path);
  }

  if (translated === undefined) {
    // Key not found in dictionaries: format fallback nicely with spaces
    const parts = path.split('.');
    const rawFallback = parts[parts.length - 1] || path;
    return formatFallback(rawFallback);
  }

  if (params && Object.keys(params).length > 0) {
    return translated.replace(/\{(\w+)\}/g, (match, key) => {
      if (key in params && params[key] !== undefined && params[key] !== null) {
        return String(params[key]);
      }
      return match;
    });
  }

  return translated;
}

export function setLocale(locale: Locale): void {
  if (locale === 'en' || locale === 'sw') {
    currentLocale.value = locale;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }
}

export function useI18n() {
  return {
    t,
    currentLocale,
    locale: currentLocale,
    setLocale,
    availableLocales,
    isSwahili: computed(() => currentLocale.value === 'sw'),
    isEnglish: computed(() => currentLocale.value === 'en'),
  };
}

export const i18nPlugin = {
  install(app: App) {
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$i18n = {
      locale: currentLocale,
      setLocale,
      availableLocales,
    };
    app.provide('i18n', {
      t,
      currentLocale,
      setLocale,
      availableLocales,
    });
  },
};

export default i18nPlugin;
