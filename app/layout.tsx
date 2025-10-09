import type { Metadata } from "next";
import { ReactNode } from "react";
import { ChakraColorModeScript } from "@/components/chakra-color-mode-script";
import AppWrapper from "@/providers/app-wrapper";
import ClientProviders from "@/providers/client-providers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elarcabeer.com"),
  title: {
    default: "El Arca Cervecería",
    template: "%s | El Arca",
  },
  description: "Cervezas artesanales inspiradas en travesías marítimas",
  openGraph: {
    title: "El Arca Cervecería",
    description: "Cervezas artesanales inspiradas en travesías marítimas",
    locale: "es",
    type: "website",
    url: "https://elarcabeer.com",
    siteName: "El Arca Beer",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ChakraColorModeScript />
        <ClientProviders>
          <AppWrapper>{children}</AppWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
