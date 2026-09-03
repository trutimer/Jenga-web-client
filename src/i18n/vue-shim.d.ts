import { t } from './index';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof t;
    $i18n: {
      locale: import('vue').Ref<import('./types').Locale>;
      setLocale: (locale: import('./types').Locale) => void;
      availableLocales: import('./types').LocaleOption[];
    };
  }
}
