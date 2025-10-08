import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {UserRole} from "@prisma/client";

import {createSupabaseMiddlewareClient} from "@/lib/supabase/middleware";
import {prisma} from "@/lib/prisma";

async function redirectToAccount(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/es/account";
  redirectUrl.search = "";

  const redirectResponse = NextResponse.redirect(redirectUrl);
  const supabase = createSupabaseMiddlewareClient(request, redirectResponse);
  await supabase.auth.getUser();

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToAccount(request);
  }

  const dbUser = await prisma.user.findUnique({
    where: {id: user.id},
    select: {
      role: true
    }
  });

  if (!dbUser || dbUser.role !== UserRole.ADMIN) {
    return redirectToAccount(request);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
