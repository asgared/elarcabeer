import createMiddleware from "next-intl/middleware";

import {defaultLocale, locales} from "./src/i18n/locales";

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix: "always"
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};
