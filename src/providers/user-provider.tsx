"use client";

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

import type {
  UserLoginPayload,
  UserRegistrationPayload,
  UserUpdatePayload,
  UserWithRelations
} from "@/types/user";

type UserStatus = "initializing" | "idle" | "loading";

type UserContextValue = {
  user: UserWithRelations | null;
  status: UserStatus;
  error: string | null;
  registerUser: (payload: UserRegistrationPayload) => Promise<UserWithRelations>;
  login: (payload: UserLoginPayload) => Promise<UserWithRelations>;
  updateUser: (payload: UserUpdatePayload) => Promise<UserWithRelations>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = "elarcabeer:userId";

async function parseResponse(response: Response) {
  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function UserProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [status, setStatus] = useState<UserStatus>("initializing");
  const [error, setError] = useState<string | null>(null);

  const handleUserResponse = useCallback((data: {user: UserWithRelations}) => {
    setUser(data.user);
    window.localStorage.setItem(STORAGE_KEY, data.user.id);
    setStatus("idle");
    setError(null);
    return data.user;
  }, []);

  const handleError = useCallback(async (response: Response) => {
    const payload = await parseResponse(response);

    if (payload?.error) {
      if (typeof payload.error === "string") {
        throw new Error(payload.error);
      }

      if (payload.error?.formErrors?.length) {
        throw new Error(payload.error.formErrors.join("\n"));
      }
    }

    if (typeof payload === "string") {
      throw new Error(payload);
    }

    throw new Error("Ocurrió un error inesperado");
  }, []);

  const fetchUser = useCallback(
    async (id: string) => {
      try {
        setStatus((current) => (current === "initializing" ? "initializing" : "loading"));
        const response = await fetch(`/api/users/${id}`, {cache: "no-store"});

        if (!response.ok) {
          if (response.status === 404) {
            window.localStorage.removeItem(STORAGE_KEY);
            setUser(null);
            setStatus("idle");
            return;
          }

          await handleError(response);
        }

        const data = (await response.json()) as {user: UserWithRelations};
        setUser(data.user);
        setStatus("idle");
        setError(null);
      } catch (error) {
        console.error(error);
        setStatus("idle");
        setError(error instanceof Error ? error.message : "Error desconocido");
      }
    },
    [handleError]
  );

  useEffect(() => {
    const storedId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

    if (storedId) {
      void fetchUser(storedId);
    } else {
      setStatus("idle");
    }
  }, [fetchUser]);

  const registerUser = useCallback(
    async (payload: UserRegistrationPayload) => {
      try {
        setStatus("loading");
        setError(null);
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          await handleError(response);
        }

        const data = (await response.json()) as {user: UserWithRelations};
        return handleUserResponse(data);
      } catch (error) {
        setStatus("idle");
        const message = error instanceof Error ? error.message : "No se pudo crear la cuenta";
        setError(message);
        throw new Error(message);
      }
    },
    [handleError, handleUserResponse]
  );

  const login = useCallback(
    async (payload: UserLoginPayload) => {
      try {
        setStatus("loading");
        setError(null);
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          await handleError(response);
        }

        const data = (await response.json()) as {user: UserWithRelations};
        return handleUserResponse(data);
      } catch (error) {
        setStatus("idle");
        const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
        setError(message);
        throw new Error(message);
      }
    },
    [handleError, handleUserResponse]
  );

  const updateUser = useCallback(
    async (payload: UserUpdatePayload) => {
      if (!user) {
        throw new Error("No hay usuario activo");
      }

      try {
        setStatus("loading");
        setError(null);
        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          await handleError(response);
        }

        const data = (await response.json()) as {user: UserWithRelations};
        return handleUserResponse(data);
      } catch (error) {
        setStatus("idle");
        const message = error instanceof Error ? error.message : "No se pudo actualizar el perfil";
        setError(message);
        throw new Error(message);
      }
    },
    [handleError, handleUserResponse, user]
  );

  const refreshUser = useCallback(async () => {
    if (!user) {
      return;
    }

    await fetchUser(user.id);
  }, [fetchUser, user]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({user, status, error, registerUser, login, updateUser, refreshUser, logout, clearError}),
    [user, status, error, registerUser, login, updateUser, refreshUser, logout, clearError]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe utilizarse dentro de UserProvider");
  }

  return context;
}
