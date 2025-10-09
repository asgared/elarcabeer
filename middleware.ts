import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {getSupabaseUserFromRequest} from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const user = getSupabaseUserFromRequest(request);
  const role =
    user?.app_metadata && typeof user.app_metadata.role === "string"
      ? (user.app_metadata.role as string)
      : undefined;

  if (!user || role !== "ADMIN") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/account";
    redirectUrl.search = "";
    redirectUrl.hash = "";

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};