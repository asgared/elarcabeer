import {createBrowserClient} from "@supabase/auth-helpers-nextjs";
import type {SupabaseClient} from "@supabase/supabase-js";

export function createSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase client environment variables are not defined");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
