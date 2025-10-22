// app/providers.tsx
"use client"; // Muy importante

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { DefaultSeo } from "next-seo";
import { ReactNode, useMemo } from "react";

import { AnalyticsProvider } from "@/providers/analytics-provider";
import { CartDrawerProvider } from "@/providers/cart-drawer-provider";
import { UserProvider } from "@/providers/UserProvider"; // Asegúrate que la ruta sea correcta
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { theme } from "@/theme";
import seoConfig from "../next-seo.config";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  // Usamos useMemo para crear el cliente Supabase solo una vez
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DefaultSeo {...seoConfig} />
        <AnalyticsProvider>
          {/* Pasamos el cliente Supabase memoizado al UserProvider */}
          <UserProvider supabaseClient={supabaseClient}>
            <CartDrawerProvider>{children}</CartDrawerProvider>
          </UserProvider>
        </AnalyticsProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}