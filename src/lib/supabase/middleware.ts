import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Supabase client for Next.js Edge Middleware
// ---------------------------------------------------------------------------
// In middleware we cannot use `next/headers` — cookies must be read from
// the incoming request and written onto a cloned response.
// ---------------------------------------------------------------------------

export function createSupabaseMiddlewareClient(request: NextRequest) {
    // Start with a "pass-through" response that we'll enrich with cookies.
    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
            "[supabase/middleware] NEXT_PUBLIC_SUPABASE_URL or ANON_KEY not configured.",
        );
        return { supabase: null, response };
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                // Propagate the cookie to the browser via the response.
                request.cookies.set({ name, value, ...options });
                response = NextResponse.next({
                    request: { headers: request.headers },
                });
                response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                request.cookies.set({ name, value: "", ...options });
                response = NextResponse.next({
                    request: { headers: request.headers },
                });
                response.cookies.set({ name, value: "", ...options });
            },
        },
    });

    return { supabase, response };
}
