// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
// 1. Importa ColorModeScript directamente de Chakra UI
import { ColorModeScript } from "@chakra-ui/react";

import { themeConfig } from "@/theme/config"; // 2. Importa tu configuración de tema
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* 3. Usa ColorModeScript directamente, pasándole el modo inicial */}
        <ColorModeScript initialColorMode={themeConfig.initialColorMode} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}