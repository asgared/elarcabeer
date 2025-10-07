import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

import {createSupabaseMiddlewareClient} from "@/lib/supabase/middleware";
import {defaultLocale, locales} from "@/i18n/locales";

const PUBLIC_FILE = /\.[^/]+$/;

type AppLocale = (typeof locales)[number];

function resolveLocaleFromCookie(request: NextRequest): AppLocale {
  const locale = request.cookies.get("NEXT_LOCALE")?.value as AppLocale | undefined;

  if (locale && locales.includes(locale)) {
    return locale;
  }

  return defaultLocale;
}

function getCurrentLocale(pathname: string, fallback: AppLocale): AppLocale {
  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0];

  if (potentialLocale && locales.includes(potentialLocale as AppLocale)) {
    return potentialLocale as AppLocale;
  }

  return fallback;
}

function stripLocaleFromPath(pathname: string, locale: AppLocale) {
  if (pathname.startsWith(`/${locale}`)) {
    const remainder = pathname.slice(locale.length + 1);
    return `/${remainder}`.replace(/\/+/g, "/");
  }

  return pathname;
}

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeFromCookie = resolveLocaleFromCookie(request);
  const hasLocalePrefix = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (!hasLocalePrefix) {
    const redirectURL = request.nextUrl.clone();
    redirectURL.pathname = `/${localeFromCookie}${pathname === "/" ? "" : pathname}`;

    const redirectResponse = NextResponse.redirect(redirectURL);
    const supabase = createSupabaseMiddlewareClient(request, redirectResponse);
    await supabase.auth.getUser();

    return redirectResponse;
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: {user}
  } = await supabase.auth.getUser();

  const currentLocale = getCurrentLocale(pathname, localeFromCookie);
  const normalizedPath = stripLocaleFromPath(pathname, currentLocale);

  if (!user && normalizedPath.startsWith("/dashboard")) {
    const redirectURL = request.nextUrl.clone();
    redirectURL.pathname = `/${currentLocale}/account`;

    const redirectResponse = NextResponse.redirect(redirectURL);
    const redirectSupabase = createSupabaseMiddlewareClient(request, redirectResponse);
    await redirectSupabase.auth.getUser();

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/", "/(es|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"]
};
