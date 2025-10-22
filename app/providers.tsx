// app/providers.tsx (Simplificado)
"use client";

// 1. ELIMINA la importación de CacheProvider
// import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { DefaultSeo } from "next-seo";
import { ReactNode, useMemo } from "react";

import { AnalyticsProvider } from "@/providers/analytics-provider";
import { CartDrawerProvider } from "@/providers/cart-drawer-provider";
import { UserProvider } from "@/providers/UserProvider"; // Asegúrate que la ruta sea correcta
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { theme } from "@/theme"; // Mantén la importación del tema
import seoConfig from "../next-seo.config";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    // 2. ELIMINA el componente <CacheProvider> que envolvía todo
    <ChakraProvider theme={theme}>
      <DefaultSeo {...seoConfig} />
      <AnalyticsProvider>
        <UserProvider supabaseClient={supabaseClient}>
          <CartDrawerProvider>{children}</CartDrawerProvider>
        </UserProvider>
      </AnalyticsProvider>
    </ChakraProvider>
  );
}