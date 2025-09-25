import type {Metadata} from "next";
import {Inter, Playfair_Display} from "next/font/google";
import {ReactNode} from "react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "El Arca Cervecería",
  description: "Experiencia digital inmersiva para la cervecería El Arca"
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html
      className={`${inter.variable} ${playfair.variable}`}
      lang="es"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
