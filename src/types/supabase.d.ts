declare module "@supabase/supabase-js" {
  export type User = {
    id: string;
    email?: string;
    user_metadata: Record<string, unknown>;
  };

  export type Session = {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    expires_at?: number;
    user: User | null;
  } | null;

  export type AuthResponse = {
    data: {
      session: Session;
      user: User | null;
    };
    error: {message: string} | null;
  };

  export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED" | "PASSWORD_RECOVERY" | string;

  export type SupabaseClient<Database = any> = {
    auth: {
      getSession(): Promise<{data: {session: Session}; error: {message: string} | null}>;
      onAuthStateChange(
        callback: (event: AuthChangeEvent, session: Session) => void | Promise<void>
      ): {data: {subscription: {unsubscribe(): void}}};
      signInWithPassword(credentials: {email: string; password: string}): Promise<AuthResponse>;
      signUp(credentials: {
        email: string;
        password: string;
        options?: {
          data?: Record<string, unknown>;
          emailRedirectTo?: string;
        };
      }): Promise<AuthResponse>;
      signOut(): Promise<{error: {message: string} | null}>;
      updateUser(attributes: {
        email?: string;
        password?: string;
        data?: Record<string, unknown>;
      }): Promise<{data: {user: User | null}; error: {message: string} | null}>;
    };
  };
}

declare module "@supabase/auth-helpers-nextjs" {
  import type {SupabaseClient} from "@supabase/supabase-js";

  export function createClientComponentClient<Database = any>(config?: {
    supabaseUrl?: string;
    supabaseKey?: string;
  }): SupabaseClient<Database>;

  export function createServerComponentClient<Database = any>(config: {
    cookies: () => ReturnType<typeof import("next/headers").cookies>;
    supabaseUrl?: string;
    supabaseKey?: string;
  }): SupabaseClient<Database>;
}
