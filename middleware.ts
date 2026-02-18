import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

// ---------------------------------------------------------------------------
// Middleware — protects /dashboard routes
// ---------------------------------------------------------------------------
//
// All admin functionality lives under /dashboard.
//
// Authentication:
//   Supabase JWT validated via `auth.getUser()`.
//   Roles resolved via `user_roles` → `Role` join.
//   Only users whose role key is in DASHBOARD_ALLOWED_ROLES may proceed.
//
// Defense-in-depth:
//   The `(admin)` layout also calls `requireDashboardAccess()` server-side,
//   so even if middleware is bypassed, the layout rejects the request.
//
// ⚠️  Safe paths (/_next/static, /_next/image, images, /api/auth) are
//     excluded via the `config.matcher` — no redirect loops.
// ---------------------------------------------------------------------------

/** Roles that are allowed to access /dashboard routes. */
const DASHBOARD_ALLOWED_ROLES = ["superadmin", "content_editor", "user_admin"];

/** Paths under /dashboard that are always public (no session required). */
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/health"];

// ---------------------------------------------------------------------------
// Supabase auth + user_roles RBAC check
// ---------------------------------------------------------------------------

type DashboardAccessResult =
  | { status: "allowed"; response: NextResponse }
  | { status: "no-session" }
  | { status: "forbidden" };

/**
 * Verify the current Supabase user's role via the `user_roles` + `Role` tables.
 *
 * Flow:
 *  1. Create a Supabase middleware client (Edge-safe).
 *  2. Call `auth.getUser()` to validate the JWT.
 *  3. Query `user_roles` joined with `Role` to get the user's role keys.
 *  4. Check if any role key is in the allowed list.
 */
async function checkDashboardRouteAccess(
  request: NextRequest,
): Promise<DashboardAccessResult> {
  try {
    const { supabase, response } = createSupabaseMiddlewareClient(request);

    // If Supabase is not configured, deny access gracefully.
    if (!supabase) {
      return { status: "no-session" };
    }

    // 1. Authenticate the user via Supabase JWT
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { status: "no-session" };
    }

    // 2. Query the user's roles via user_roles → Role join
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("Role ( key )")
      .eq("userId", user.id);

    if (rolesError) {
      console.error("[middleware] Failed to fetch user roles:", rolesError.message);
      return { status: "no-session" };
    }

    // 3. Extract role keys and check against allowed list
    const roleKeys: string[] = (userRoles ?? [])
      .map((ur: Record<string, unknown>) => {
        const role = ur.Role as { key: string } | null;
        return role?.key ?? null;
      })
      .filter((key): key is string => key !== null);

    const isAllowed = roleKeys.some((key) => DASHBOARD_ALLOWED_ROLES.includes(key));

    if (!isAllowed) {
      return { status: "forbidden" };
    }

    // Return the response that carries refreshed auth cookies.
    return { status: "allowed", response };
  } catch (error) {
    console.error("[middleware] Unexpected error in dashboard route check:", error);
    return { status: "no-session" };
  }
}

// ---------------------------------------------------------------------------
// Main middleware handler
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── /dashboard route protection ──────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // Allow public dashboard paths (login page, health check)
    if (PUBLIC_DASHBOARD_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    const result = await checkDashboardRouteAccess(request);

    if (result.status === "allowed") {
      return result.response;
    }

    if (result.status === "forbidden") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.searchParams.set("error", "unauthorized");
      homeUrl.hash = "";
      return NextResponse.redirect(homeUrl);
    }

    // no-session → redirect to dashboard login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/dashboard/login";
    loginUrl.searchParams.set("returnTo", pathname);
    loginUrl.hash = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Route matcher — excludes safe paths to avoid redirect loops
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/dashboard/:path*",
    /*
     * Explicitly EXCLUDED (not matched):
     *  - /_next/static   (static assets)
     *  - /_next/image    (image optimization)
     *  - /favicon.ico    (favicon)
     *  - /api/auth       (auth callbacks)
     *  - Image files     (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
  ],
};