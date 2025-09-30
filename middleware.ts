import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

import {defaultLocale, locales} from "@/i18n/locales";

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocalePrefix = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  const locale = request.cookies.get("NEXT_LOCALE")?.value as (typeof locales)[number] | undefined;
  const targetLocale = locale && locales.includes(locale) ? locale : defaultLocale;

  const redirectURL = request.nextUrl.clone();
  redirectURL.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(redirectURL);
}

export const config = {
  matcher: ["/", "/(es|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"]
};
