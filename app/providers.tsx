"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { DefaultSeo } from "next-seo";
import { ReactNode, useMemo } from "react";

// Asumo que estas son las rutas a tus otros providers, ajústalas si es necesario
import { AnalyticsProvider } from "@/providers/analytics-provider";
import { CartDrawerProvider } from "@/providers/cart-drawer-provider";
import { UserProvider } from "@/providers/UserProvider";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import seoConfig from "../next-seo.config"; 
import { theme } from "@/theme";

export function Providers({ children }: { children: ReactNode }) {
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DefaultSeo {...seoConfig} />
        <AnalyticsProvider>
          <UserProvider supabaseClient={supabaseClient}>
            <CartDrawerProvider>{children}</CartDrawerProvider>
          </UserProvider>
        </AnalyticsProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}