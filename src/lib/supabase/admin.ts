import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createSupabaseAdminClient must only be called in a server-side context."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase URL or Service Role Key are not defined for admin client."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

