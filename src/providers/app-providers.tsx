"use client";

import {CacheProvider} from "@chakra-ui/next-js";
import {ChakraProvider, ColorModeScript} from "@chakra-ui/react";
import {DefaultSeo} from "next-seo";
import {ReactNode} from "react";

import {AnalyticsProvider} from "./analytics-provider";
import {CartDrawerProvider} from "./cart-drawer-provider";
import {UserProvider} from "./user-provider";
import {theme} from "../theme";
import seoConfig from "../../next-seo.config";

type Props = {
  children: ReactNode;
  locale: string;
};

export function AppProviders({children, locale}: Props) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <DefaultSeo {...seoConfig} />
        <AnalyticsProvider locale={locale}>
          <UserProvider>
            <CartDrawerProvider>{children}</CartDrawerProvider>
          </UserProvider>
        </AnalyticsProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
