import type {Metadata} from "next";
import {ReactNode} from "react";
import {ColorModeScript} from "@chakra-ui/react";

import ClientProviders from "@/providers/client-providers";
import {theme} from "@/theme";

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
    locale: "es_ES",
    siteName: "El Arca Beer",
  },
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="es">
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
