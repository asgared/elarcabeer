import {notFound} from "next/navigation";

import type {AppLocale} from "./locales";
import {defaultLocale, locales} from "./locales";

export function resolveLocale(locale?: string): AppLocale {
  if (!locale) {
    return defaultLocale;
  }

  if (locales.includes(locale as AppLocale)) {
    return locale as AppLocale;
  }

  notFound();
}
export async function loadMessages(locale: AppLocale): Promise<Record<string, unknown>> {
  switch (locale) {
    case "es":
      return (await import("../messages/es.json")).default;
    case "en":
      return (await import("../messages/en.json")).default;
    default:
      notFound();
  }
}
