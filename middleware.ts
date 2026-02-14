import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Dashboard protection middleware
// ---------------------------------------------------------------------------
// Current strategy: validate the custom AdminSession cookie via an internal
// API call.  The `/api/admin/session` route checks the cookie hash against
// the `AdminSession` table and verifies the user holds the required RBAC
// role(s) in the `user_roles` table.
//
// ⚠️  This middleware does NOT decode JWTs — session validation is 100%
//     server-side via Prisma queries.
//
// TODO (RBAC Phase 2):
//   1. Import `getAllowedRoles` from `@/lib/auth/permissions`
//   2. Resolve the required roles for the current pathname
//   3. Compare against the user's roles returned by `/api/admin/session`
//   4. Return 403 if the user lacks the required role for the specific
//      sub-route (currently all admin routes require "ADMIN" / superadmin).
// ---------------------------------------------------------------------------

/** Paths under /dashboard that are always public (no session required). */
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/health"];

async function hasAdminSession(request: NextRequest): Promise<boolean> {
  try {
    const response = await fetch(new URL("/api/admin/session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json().catch(() => null)) as
      | { user?: { roles?: string[] } | null }
      | null;

    // TODO (RBAC Phase 2): check specific roles per route here
    return Array.isArray(payload?.user?.roles) && payload.user.roles.length > 0;
  } catch (error) {
    console.error("Failed to validate admin session in middleware", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard and its sub-routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Allow public dashboard paths (login page, health check)
  if (PUBLIC_DASHBOARD_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Validate admin session
  if (await hasAdminSession(request)) {
    return NextResponse.next();
  }

  // No valid admin session — redirect to login with returnTo
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/dashboard/login";
  redirectUrl.searchParams.set("returnTo", pathname);
  redirectUrl.hash = "";

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};