"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { DefaultSeo } from "next-seo";
import { ReactNode } from "react";

import seoConfig from "../../next-seo.config";
import { theme } from "../theme";
import { AnalyticsProvider } from "./analytics-provider";

// Este componente ahora solo maneja proveedores estáticos
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DefaultSeo {...seoConfig} />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}