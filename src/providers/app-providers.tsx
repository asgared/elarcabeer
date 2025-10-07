"use client";

import {CacheProvider} from "@chakra-ui/next-js";
import {ChakraProvider} from "@chakra-ui/react";
import {DefaultSeo} from "next-seo";
import {ReactNode, useMemo} from "react";

import {AnalyticsProvider} from "./analytics-provider";
import {CartDrawerProvider} from "./cart-drawer-provider";
import {UserProvider} from "./UserProvider";
import {theme} from "../theme";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";
import seoConfig from "../../next-seo.config";

type Props = {
  children: ReactNode;
  locale: string;
};

export function AppProviders({children, locale}: Props) {
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DefaultSeo {...seoConfig} />
        <AnalyticsProvider locale={locale}>
          <UserProvider supabaseClient={supabaseClient}>
            <CartDrawerProvider>{children}</CartDrawerProvider>
          </UserProvider>
        </AnalyticsProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
