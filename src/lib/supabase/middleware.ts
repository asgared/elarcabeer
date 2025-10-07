import type {NextRequest} from "next/server";
import type {NextResponse} from "next/server";
import {createServerClient, type CookieOptions} from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        response.cookies.set({
          name,
          value,
          ...options
        });
      },
      remove(name: string, options?: CookieOptions) {
        response.cookies.set({
          name,
          value: "",
          ...options,
          maxAge: 0
        });
      }
    }
  });
}
