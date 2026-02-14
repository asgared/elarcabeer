import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

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