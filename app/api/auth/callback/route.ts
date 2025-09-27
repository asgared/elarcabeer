import {NextResponse} from "next/server";
import type {Session} from "@supabase/supabase-js";

import {createSupabaseRouteHandlerClient} from "@/lib/supabase/route";

type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED";

type AuthCallbackPayload = {
  event: AuthEvent;
  session: Session | null;
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient();
  const payload = (await request.json()) as AuthCallbackPayload;

  if (payload.event === "SIGNED_OUT") {
    await supabase.auth.signOut();
    return NextResponse.json({success: true});
  }

  if (payload.session) {
    await supabase.auth.setSession({
      access_token: payload.session.access_token,
      refresh_token: payload.session.refresh_token
    });
  }

  return NextResponse.json({success: true});
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createSupabaseRouteHandlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectTo = next.startsWith("/") ? next : "/";

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
