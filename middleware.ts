import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {getSupabaseUserFromRequest} from "@/lib/supabase/middleware";
import { defaultLocale, locales } from "@/i18n/locales";

// --- Lógica de Internacionalización (la mantenemos) ---
const PUBLIC_FILE = /\.[^/]+$/;
type AppLocale = (typeof locales)[number];

function resolveLocaleFromCookie(request: NextRequest): AppLocale {
  const locale = request.cookies.get("NEXT_LOCALE")?.value as
    | AppLocale
    | undefined;
  if (locale && locales.includes(locale)) {
    return locale;
  }
  return defaultLocale;
}

// --- Middleware Principal ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Saltamos los assets y rutas de API (lógica original)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Gestionamos el prefijo de idioma (lógica original)
  const localeFromCookie = resolveLocaleFromCookie(request);
  const hasLocalePrefix = locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocalePrefix) {
    const redirectURL = request.nextUrl.clone();
    redirectURL.pathname = `/${localeFromCookie}${
      pathname === "/" ? "" : pathname
    }`;
    return NextResponse.redirect(redirectURL);
  }

  const response = NextResponse.next();
  const user = getSupabaseUserFromRequest(request);

  // --- INICIO: LÓGICA DE PROTECCIÓN DE DASHBOARD (la nueva parte) ---
  const isAdminRoute = locales.some((locale) =>
    pathname.startsWith(`/${locale}/dashboard`)
  );

  if (isAdminRoute) {
    // Si no hay usuario o el usuario no es ADMIN, redirigimos
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${localeFromCookie}/account`;
      return NextResponse.redirect(redirectUrl);
    }

    // Leemos el rol desde los metadatos de la sesión, no de la base de datos
    const role =
      user.app_metadata && typeof user.app_metadata.role === "string"
        ? (user.app_metadata.role as string)
        : undefined;

    if (role !== "ADMIN") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${localeFromCookie}/account`;
      return NextResponse.redirect(redirectUrl);
    }
  }
  // --- FIN: LÓGICA DE PROTECCIÓN DE DASHBOARD ---

  return response;
}

// 3. Restauramos el matcher original para que cubra toda la app
export const config = {
  matcher: ["/", "/(es|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};