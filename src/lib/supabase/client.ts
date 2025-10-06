"use client";

import {createClientComponentClient, type SupabaseClient} from "@supabase/auth-helpers-nextjs";

export type BrowserSupabaseClient = SupabaseClient;

export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  return createClientComponentClient();
}

