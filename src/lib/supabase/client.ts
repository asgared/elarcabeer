"use client";

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import * as SupabaseSSR from "@supabase/ssr";

type CreateBrowserClientFn = (
  supabaseUrl: string,
  supabaseAnonKey: string
) => SupabaseClient;

const ssrBrowserFactory: CreateBrowserClientFn | undefined = (() => {
  const candidate = (SupabaseSSR as {
    createBrowserClient?: unknown;
    createBrowserSupabaseClient?: unknown;
  }).createBrowserClient;

  if (typeof candidate === "function") {
    return candidate as CreateBrowserClientFn;
  }

  const legacyCandidate = (SupabaseSSR as {
    createBrowserSupabaseClient?: unknown;
  }).createBrowserSupabaseClient;

  if (typeof legacyCandidate === "function") {
    return legacyCandidate as CreateBrowserClientFn;
  }

  return undefined;
})();

let hasLoggedFallbackWarning = false;

export function createSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("CLIENT-SIDE: Missing Supabase environment variables");
  }

  if (ssrBrowserFactory) {
    return ssrBrowserFactory(supabaseUrl, supabaseAnonKey);
  }

  if (process.env.NODE_ENV !== "production" && !hasLoggedFallbackWarning) {
    console.warn(
      "@supabase/ssr does not expose createBrowserClient. Falling back to createClient()."
    );
    hasLoggedFallbackWarning = true;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
