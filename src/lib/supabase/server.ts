import {cookies} from "next/headers";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import * as SupabaseSSR from "@supabase/ssr";
import type {CookieOptions} from "@supabase/ssr";
"use server";

type CreateServerClientFn = (
  supabaseUrl: string,
  supabaseAnonKey: string,
  options: {
    cookies: {
      get(name: string): string | undefined;
      set(name: string, value: string, options: CookieOptions): void;
      remove(name: string, options: CookieOptions): void;
    };
  }
) => SupabaseClient;

const ssrServerFactory: CreateServerClientFn | undefined = (() => {
  const candidate = (SupabaseSSR as {
    createServerClient?: unknown;
    createServerSupabaseClient?: unknown;
  }).createServerClient;

  if (typeof candidate === "function") {
    return candidate as CreateServerClientFn;
  }

  const legacyCandidate = (SupabaseSSR as {
    createServerSupabaseClient?: unknown;
  }).createServerSupabaseClient;

  if (typeof legacyCandidate === "function") {
    return legacyCandidate as CreateServerClientFn;
  }

  return undefined;
})();

let hasLoggedServerFallbackWarning = false;

export function createSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SERVER-SIDE: Missing Supabase environment variables");
  }

  if (ssrServerFactory) {
    return ssrServerFactory(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({name, value, ...options});
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({name, value: "", ...options});
        },
      },
    });
  }

  if (process.env.NODE_ENV !== "production" && !hasLoggedServerFallbackWarning) {
    console.warn(
      "@supabase/ssr does not expose createServerClient. Falling back to createClient() without cookie management."
    );
    hasLoggedServerFallbackWarning = true;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
