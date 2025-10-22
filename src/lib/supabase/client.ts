"use client";

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import * as SupabaseSSR from "@supabase/ssr";

const DEFAULT_LOCAL_SITE_URL = "http://localhost:3000";
const DEFAULT_PRODUCTION_SITE_URL = "https://elarcabeer.com";

type CreateBrowserClientFn = (
  supabaseUrl: string,
  supabaseAnonKey: string
) => SupabaseClient;

const ssrBrowserFactory: CreateBrowserClientFn | undefined = (() => {
  const candidate = Reflect.get(
    SupabaseSSR as Record<string, unknown>,
    "createBrowserClient"
  );

  if (typeof candidate === "function") {
    return candidate as CreateBrowserClientFn;
  }

  const legacyCandidate = Reflect.get(
    SupabaseSSR as Record<string, unknown>,
    "createBrowserSupabaseClient"
  );

  if (typeof legacyCandidate === "function") {
    return legacyCandidate as CreateBrowserClientFn;
  }

  return undefined;
})();

let hasLoggedFallbackWarning = false;
let fallbackSupabaseClient: SupabaseClient | null = null;

function resolveEnvSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;

  if (!envUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }

  return `https://${envUrl.replace(/\/$/, "")}`;
}

export function getSiteUrl() {
  const envUrl = resolveEnvSiteUrl();

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return process.env.NODE_ENV === "development"
    ? DEFAULT_LOCAL_SITE_URL
    : DEFAULT_PRODUCTION_SITE_URL;
}

export function getSupabaseAuthRedirectUrl(path = "/auth/callback") {
  const baseUrl = getSiteUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function createFallbackSupabaseClient(): SupabaseClient {
  const fallbackMessage = "Supabase no está configurado";

  const subscription = {
    unsubscribe() {
      // no-op
    },
  };

  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange() {
        return { data: { subscription }, error: null };
      },
      async signOut() {
        return { error: null } as const;
      },
      async signInWithPassword() {
        return {
          data: { user: null },
          error: { message: fallbackMessage },
        } as const;
      },
      async updateUser() {
        return {
          data: null,
          error: { message: fallbackMessage },
        } as const;
      },
    },
  } as unknown as SupabaseClient;
}

export function createSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!fallbackSupabaseClient) {
      console.warn("[supabase] Variables NEXT_PUBLIC_SUPABASE_URL o KEY no configuradas.");
      fallbackSupabaseClient = createFallbackSupabaseClient();
    }

    return fallbackSupabaseClient;
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
