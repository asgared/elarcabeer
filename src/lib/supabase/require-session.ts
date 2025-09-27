import type {Session} from "@supabase/supabase-js";
import {redirect} from "next/navigation";

import {createSupabaseServerClient} from "./server";

export async function requireSupabaseSession(locale: string): Promise<Session> {
  const supabase = createSupabaseServerClient();
  const {
    data: {session},
    error
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session) {
    redirect(`/${locale}/auth/sign-in`);
  }

  return session;
}
