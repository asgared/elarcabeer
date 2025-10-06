import {cookies} from "next/headers";
import {createRouteHandlerClient, type SupabaseClient} from "@supabase/auth-helpers-nextjs";

export type RouteHandlerSupabaseClient = SupabaseClient;

export function createRouteSupabaseClient(): RouteHandlerSupabaseClient {
  return createRouteHandlerClient({cookies});
}

