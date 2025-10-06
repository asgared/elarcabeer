import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {createMiddlewareClient} from "@supabase/auth-helpers-nextjs";

import {defaultLocale, locales} from "@/i18n/locales";

const PUBLIC_FILE = /\.[^/]+$/;

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient({req: request, res: response});
  const {
    data: {session}
  } = await supabase.auth.getSession();

  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0];
  const hasLocalePrefix = locales.includes(potentialLocale as (typeof locales)[number]);
  const pathAfterLocale = `/${segments.slice(hasLocalePrefix ? 1 : 0).join("/")}`;

  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({error: "No autorizado"}, {status: 401});
    }

    return response;
  }

  if (pathAfterLocale.startsWith("/dashboard")) {
    if (!session) {
      const redirectURL = request.nextUrl.clone();
      const targetLocale = hasLocalePrefix ? potentialLocale : defaultLocale;
      redirectURL.pathname = `/${targetLocale}/account`;
      redirectURL.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectURL);
    }

    return response;
  }

  if (pathname.startsWith("/api")) {
    return response;
  }

  if (hasLocalePrefix) {
    return response;
  }

  const storedLocale = request.cookies.get("NEXT_LOCALE")?.value as (typeof locales)[number] | undefined;
  const targetLocale = storedLocale && locales.includes(storedLocale) ? storedLocale : defaultLocale;

  const redirectURL = request.nextUrl.clone();
  redirectURL.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(redirectURL);
}

export const config = {
  matcher: ["/", "/(es|en)/:path*", "/api/admin/:path*", "/dashboard/:path*", "/((?!_next|_vercel|.*\\..*).*)"]
};
