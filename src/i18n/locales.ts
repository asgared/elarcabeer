export const locales = ['es', 'en'] as const;
export type AppLocale = typeof locales[number];

export const defaultLocale: AppLocale = "es";

export const localeLabels: Record<AppLocale, string> = {
  "es": "México",
  "en": "United States"
};
