import {notFound} from "next/navigation";
import {getRequestConfig} from "next-intl/server";

import {AppLocale, defaultLocale, locales} from "./locales";

export default getRequestConfig(async ({locale}) => {
  const appLocale = (locale ?? defaultLocale) as AppLocale;

  if (!locales.includes(appLocale)) {
    notFound();
  }

  const messages = (await import(`../messages/${appLocale}.json`)).default;

  return {
    messages
  };
});
