import type {Metadata} from "next";
import {ReactNode} from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "El Arca Cervecería",
  description: "Experiencia digital inmersiva para la cervecería El Arca"
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
