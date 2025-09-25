export const locales = ["es-MX", "en-US"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "es-MX";

export const localeLabels: Record<AppLocale, string> = {
  "es-MX": "México",
  "en-US": "United States"
};
