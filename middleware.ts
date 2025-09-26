import createMiddleware from "next-intl/middleware";

import {defaultLocale, locales} from "@/i18n/locales";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: true
});

export const config = {
  matcher: ["/", "/(es|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"]
};