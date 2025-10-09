declare module "@supabase/supabase-js" {
  interface User {
    user_metadata: Record<string, unknown>;
  }
}

