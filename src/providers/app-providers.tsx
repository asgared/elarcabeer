"use client";

import {CacheProvider} from "@chakra-ui/next-js";
import {ChakraProvider} from "@chakra-ui/react";
import {SessionContextProvider} from "@supabase/auth-helpers-react";
import type {Session} from "@supabase/supabase-js";
import {DefaultSeo} from "next-seo";
import {ReactNode, useMemo} from "react";

import {AnalyticsProvider} from "./analytics-provider";
import {CartDrawerProvider} from "./cart-drawer-provider";
import {UserProvider} from "./user-provider";
import {theme} from "../theme";
import seoConfig from "../../next-seo.config";
import {createBrowserSupabaseClient} from "@/lib/supabase/client";

type Props = {
  children: ReactNode;
  locale: string;
  initialSession?: Session | null;
};

export function AppProviders({children, locale, initialSession}: Props) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DefaultSeo {...seoConfig} />
        <SessionContextProvider supabaseClient={supabase} initialSession={initialSession ?? undefined}>
          <AnalyticsProvider locale={locale}>
            <UserProvider>
              <CartDrawerProvider>{children}</CartDrawerProvider>
            </UserProvider>
          </AnalyticsProvider>
        </SessionContextProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
