import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import type {SupabaseClient} from "@supabase/supabase-js";
import {cookies} from "next/headers";

export function createSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase server environment variables are not defined");
  }

  return createServerComponentClient({
    cookies,
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });
}
