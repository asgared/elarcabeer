import {cookies} from "next/headers";
import {createServerComponentClient, type SupabaseClient} from "@supabase/auth-helpers-nextjs";

export type ServerSupabaseClient = SupabaseClient;

export function createServerSupabaseClient(): ServerSupabaseClient {
  return createServerComponentClient({cookies});
}

