"use client";

import {CacheProvider} from "@chakra-ui/next-js";
import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import {DefaultSeo} from "next-seo";
import {ReactNode} from "react";

import {AnalyticsProvider} from "./analytics-provider";
import {CartDrawerProvider} from "./cart-drawer-provider";
import {SupabaseListener} from "./supabase-listener";
import {SupabaseProvider} from "./supabase-provider";
import {theme} from "../theme";
import seoConfig from "../../next-seo.config";
import type {Session} from "@supabase/supabase-js";

type Props = {
  children: ReactNode;
  locale: string;
  initialSession: Session | null;
  serverAccessToken?: string;
};

export function AppProviders({children, locale, initialSession, serverAccessToken}: Props) {
  return (
    <CacheProvider>
      <SupabaseProvider initialSession={initialSession}>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <DefaultSeo {...seoConfig} />
          <SupabaseListener serverAccessToken={serverAccessToken} />
          <AnalyticsProvider locale={locale}>
            <CartDrawerProvider>{children}</CartDrawerProvider>
          </AnalyticsProvider>
        </ChakraProvider>
      </SupabaseProvider>
    </CacheProvider>
  );
}
