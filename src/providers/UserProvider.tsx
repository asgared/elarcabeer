"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User as SupabaseUser,
} from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserUpdatePayload, UserWithRelations } from "@/types/user";

type UserStatus = "initializing" | "idle" | "loading";

type UserContextValue = {
  session: Session | null;
  authUser: SupabaseUser | null;
  user: UserWithRelations | null;
  status: UserStatus;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (payload: UserUpdatePayload) => Promise<UserWithRelations>;
  logout: () => Promise<void>;
  clearError: () => void;
};

type Props = {
  children: ReactNode;
  supabaseClient?: SupabaseClient;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

async function parseResponse(response: Response) {
  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function UserProvider({ children, supabaseClient }: Props) {
  const supabase = useMemo(
    () => supabaseClient ?? createSupabaseBrowserClient(),
    [supabaseClient]
  );
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [status, setStatus] = useState<UserStatus>("initializing");
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(async (response: Response) => {
    const payload = await parseResponse(response);

    if (payload?.error) {
      if (typeof payload.error === "string") {
        throw new Error(payload.error);
      }

      const { formErrors, fieldErrors } = payload.error as {
        formErrors?: string[];
        fieldErrors?: Record<string, string[]>;
      };

      if (Array.isArray(formErrors) && formErrors.length > 0) {
        throw new Error(formErrors.join("\n"));
      }

      if (fieldErrors && typeof fieldErrors === "object") {
        for (const messages of Object.values(fieldErrors)) {
          if (Array.isArray(messages) && messages.length > 0) {
            throw new Error(messages[0]);
          }
        }
      }
    }

    if (typeof payload === "string") {
      throw new Error(payload);
    }

    throw new Error("Ocurrió un error inesperado");
  }, []);

  const fetchProfile = useCallback(
    async (nextUser: SupabaseUser | null) => {
      if (!nextUser?.email) {
        setUser(null);
        setStatus("idle");
        setError(null);
        return;
      }

      try {
        setStatus((current) =>
          current === "initializing" ? "initializing" : "loading"
        );
        const response = await fetch(
          `/api/users/by-email?email=${encodeURIComponent(nextUser.email)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setUser(null);
            setStatus("idle");
            return;
          }

          await handleError(response);
        }

        const data = (await response.json()) as { user: UserWithRelations };
        setUser(data.user);
        setStatus("idle");
        setError(null);
      } catch (error) {
        console.error(error);
        setStatus("idle");
        setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    },
    [handleError]
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        const nextUser = data.session?.user ?? null;
        setAuthUser(nextUser);
        await fetchProfile(nextUser);
        setStatus("idle");
      } catch (error) {
        console.error(error);
        if (!isMounted) {
          return;
        }

        setStatus("idle");
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo obtener la sesión"
        );
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [supabase, fetchProfile]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        const nextUser = nextSession?.user ?? null;
        setAuthUser(nextUser);
        await fetchProfile(nextUser);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw new Error(error.message);
      }

      setSession(data.session);
      const nextUser = data.session?.user ?? authUser ?? null;
      setAuthUser(nextUser);
      await fetchProfile(nextUser);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la sesión";
      setStatus("idle");
      setError(message);
    }
  }, [authUser, fetchProfile, supabase]);

  const updateUser = useCallback(
    async (payload: UserUpdatePayload) => {
      if (!authUser || !user) {
        throw new Error("No hay usuario activo");
      }

      try {
        setStatus("loading");
        setError(null);

        const metadataUpdates: Record<string, string | null> = {};

        if (payload.name !== undefined) {
          metadataUpdates.name = payload.name ?? null;
        }

        if (payload.lastName !== undefined) {
          metadataUpdates.lastName = payload.lastName ?? null;
        }

        const shouldUpdateMetadata = Object.keys(metadataUpdates).length > 0;

        if (payload.email || payload.password || shouldUpdateMetadata) {
          const { error: authError } = await supabase.auth.updateUser({
            ...(payload.email ? { email: payload.email } : {}),
            ...(payload.password ? { password: payload.password } : {}),
            ...(shouldUpdateMetadata
              ? {
                data: {
                  ...authUser.user_metadata,
                  ...metadataUpdates,
                },
              }
              : {}),
          });

          if (authError) {
            throw new Error(authError.message);
          }
        }

        // Filter out password from payload before sending to API
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...apiPayload } = payload;

        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          await handleError(response);
        }

        const data = (await response.json()) as { user: UserWithRelations };
        setUser(data.user);
        setStatus("idle");
        setError(null);
        return data.user;
      } catch (error) {
        console.error(error);
        setStatus("idle");
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil";
        setError(message);
        throw new Error(message);
      }
    },
    [authUser, handleError, supabase, user]
  );

  const logout = useCallback(async () => {
    try {
      setStatus("loading");
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw new Error(signOutError.message);
      }

      setSession(null);
      setAuthUser(null);
      setUser(null);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("idle");
      const message =
        error instanceof Error ? error.message : "No se pudo cerrar sesión";
      setError(message);
      throw new Error(message);
    }
  }, [supabase]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      session,
      authUser,
      user,
      status,
      error,
      refreshUser,
      updateUser,
      logout,
      clearError,
    }),
    [
      session,
      authUser,
      user,
      status,
      error,
      refreshUser,
      updateUser,
      logout,
      clearError,
    ]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe utilizarse dentro de UserProvider");
  }

  return context;
}