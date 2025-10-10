import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {getSupabaseUserFromRequest} from "@/lib/supabase/middleware";

async function hasAdminSession(request: NextRequest) {
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
      | {user?: {role?: string} | null}
      | null;

    return payload?.user?.role === "ADMIN";
  } catch (error) {
    console.error("Failed to validate admin session in middleware", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/login") || pathname.startsWith("/dashboard/health")) {
    return NextResponse.next();
  }

  if (await hasAdminSession(request)) {
    return NextResponse.next();
  }

  const user = getSupabaseUserFromRequest(request);
  const role =
    user?.app_metadata && typeof user.app_metadata.role === "string"
      ? (user.app_metadata.role as string)
      : undefined;

  if (!user || role !== "ADMIN") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard/login";
    redirectUrl.search = "";
    redirectUrl.hash = "";

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};