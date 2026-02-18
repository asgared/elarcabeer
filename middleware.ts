import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

// ---------------------------------------------------------------------------
// Middleware — protects /dashboard routes
// ---------------------------------------------------------------------------
//
// Authentication flow:
//   1. Supabase JWT validated via `auth.getUser()` (anon-key middleware client).
//   2. Roles resolved via `user_roles` → `Role` join using a **service_role**
//      client so we bypass RLS ("permission denied for schema public").
//   3. Only users whose role key is in DASHBOARD_ALLOWED_ROLES may proceed.
//
// Defense-in-depth:
//   The `(admin)` layout also calls `requireDashboardAccess()` server-side.
//
// ⚠️  Safe paths (/_next/static, /_next/image, images, /api/auth) are
//     excluded via `config.matcher` — no redirect loops.
// ---------------------------------------------------------------------------

/** Roles that are allowed to access /dashboard routes. */
const DASHBOARD_ALLOWED_ROLES = ["superadmin", "content_editor", "user_admin"];

/** Paths under /dashboard that are always public (no session required). */
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/health"];

// ---------------------------------------------------------------------------
// Service-role client (bypasses RLS — for role queries only)
// ---------------------------------------------------------------------------

/**
 * Create a lightweight Supabase client with the service_role key.
 * This client is used exclusively for the role-lookup query so it is
 * not blocked by RLS policies.
 *
 * Returns `null` if env vars are not configured.
 */
function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.",
    );
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---------------------------------------------------------------------------
// Supabase auth + user_roles RBAC check
// ---------------------------------------------------------------------------

type DashboardAccessResult =
  | { status: "allowed"; response: NextResponse }
  | { status: "no-session" }
  | { status: "forbidden" };

/**
 * 1. Validate the JWT with `auth.getUser()` (anon-key middleware client).
 * 2. Query `user_roles` + `Role` with the service_role client (bypasses RLS).
 * 3. Check if the user holds any of the allowed roles.
 */
async function checkDashboardRouteAccess(
  request: NextRequest,
): Promise<DashboardAccessResult> {
  try {
    // ── 1. Authenticate the user (anon-key, Edge-safe) ──────────────────
    const { supabase, response } = createSupabaseMiddlewareClient(request);

    if (!supabase) {
      return { status: "no-session" };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { status: "no-session" };
    }

    // ── 2. Query roles with service_role key (bypasses RLS) ─────────────
    const admin = createServiceRoleClient();

    if (!admin) {
      // Env vars missing — cannot check roles; deny gracefully.
      console.error("[middleware] Service-role client unavailable. Denying access.");
      return { status: "no-session" };
    }

    let roleKeys: string[] = [];

    try {
      const { data: userRoles, error: rolesError } = await admin
        .from("user_roles")
        .select(`"roleId", Role:Role!inner ( key )`)
        .eq("userId", user.id);

      if (rolesError) {
        console.error(
          "[middleware] Failed to fetch user roles:",
          rolesError.message,
          rolesError.details,
          rolesError.hint,
        );
        // Don't loop — treat as no-session so the user lands on the login page.
        return { status: "no-session" };
      }

      roleKeys = (userRoles ?? [])
        .map((ur: Record<string, unknown>) => {
          const role = ur.Role as { key: string } | null;
          return role?.key ?? null;
        })
        .filter((key): key is string => key !== null);
    } catch (queryError) {
      console.error("[middleware] Unexpected error querying roles:", queryError);
      return { status: "no-session" };
    }

    // ── 3. Authorise ────────────────────────────────────────────────────
    const isAllowed = roleKeys.some((key) =>
      DASHBOARD_ALLOWED_ROLES.includes(key),
    );

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