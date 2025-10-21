import type {Metadata} from "next";
import type {ReactNode} from "react";

import {ChakraColorModeScript} from "@/components/chakra-color-mode-script";

import "./globals.css";
import {Providers} from "./providers";

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

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="es">
      <body>
        <ChakraColorModeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
