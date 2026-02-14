import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Dashboard protection middleware — Capability-based RBAC
// ---------------------------------------------------------------------------
// Strategy: validate the AdminSession cookie via `/api/admin/session`, which
// returns the user's resolved capabilities (derived from their RBAC roles).
//
// Gate logic:
//   1. No valid session → redirect to /dashboard/login?returnTo=...
//   2. Valid session but missing "dashboard:access" → redirect to /
//      (viewer role has zero capabilities, so it is ALWAYS blocked)
//   3. Has "dashboard:access" → allow through
//
// Per-section enforcement (content:read, users:read, etc.) is handled
// server-side in layouts/pages via `requireCapability()`.
//
// ⚠️  This middleware does NOT decode JWTs — validation is 100% server-side.
// ---------------------------------------------------------------------------

/** Paths under /dashboard that are always public (no session required). */
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/health"];

type SessionPayload = {
  user?: {
    roles?: string[];
    capabilities?: string[];
  } | null;
} | null;

/**
 * Fetch the current session and check for dashboard:access capability.
 * Returns:
 *   "allowed"    — session valid + has dashboard:access
 *   "forbidden"  — session valid but lacks dashboard:access
 *   "no-session" — no valid session at all
 */
async function checkDashboardAccess(
  request: NextRequest,
): Promise<"allowed" | "forbidden" | "no-session"> {
  try {
    const response = await fetch(new URL("/api/admin/session", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });

    if (!response.ok) {
      return "no-session";
    }

    const payload = (await response.json().catch(() => null)) as SessionPayload;

    if (!payload?.user) {
      return "no-session";
    }

    const capabilities = payload.user.capabilities ?? [];

    if (!capabilities.includes("dashboard:access")) {
      return "forbidden";
    }

    return "allowed";
  } catch (error) {
    console.error("Failed to validate admin session in middleware", error);
    return "no-session";
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

  const result = await checkDashboardAccess(request);

  if (result === "allowed") {
    return NextResponse.next();
  }

  if (result === "forbidden") {
    // User is authenticated but does not have dashboard:access
    // (e.g. viewer role). Redirect to home.
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    homeUrl.hash = "";
    return NextResponse.redirect(homeUrl);
  }

  // No valid admin session — redirect to login with returnTo
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/dashboard/login";
  loginUrl.searchParams.set("returnTo", pathname);
  loginUrl.hash = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};