"use client";

import { ReactNode, useMemo } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CartDrawerProvider } from "./cart-drawer-provider";
import { UserProvider } from "./UserProvider";

// Este componente envuelve a los proveedores que usan hooks y lógica de cliente
export default function AppWrapper({ children }: { children: ReactNode }) {
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <UserProvider supabaseClient={supabaseClient}>
      <CartDrawerProvider>{children}</CartDrawerProvider>
    </UserProvider>
  );
}