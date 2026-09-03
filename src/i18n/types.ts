export type Locale = 'en' | 'sw';

export interface LocaleOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
}

export type TranslationParams = Record<string, string | number>;

export type NestedTranslations = {
  [key: string]: string | NestedTranslations;
};
