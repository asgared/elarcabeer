import type {Metadata} from "next";
import {ReactNode} from "react";
import { ColorModeScript } from "@chakra-ui/react"; 
import { theme } from "@/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "El Arca Cervecería",
  description: "Experiencia digital inmersiva para la cervecería El Arca"
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="es">
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        {children}
      </body>
    </html>
  );
}
