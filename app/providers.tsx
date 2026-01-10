"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";

import { AnalyticsProvider } from "@/providers/analytics-provider";
import { CartDrawerProvider } from "@/providers/cart-drawer-provider";
import { UserProvider } from "@/providers/UserProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { theme } from "@/theme";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <ChakraProvider theme={theme}>
      <AnalyticsProvider>
        <UserProvider supabaseClient={supabaseClient}>
          <CartDrawerProvider>{children}</CartDrawerProvider>
        </UserProvider>
      </AnalyticsProvider>
    </ChakraProvider>
  );
}