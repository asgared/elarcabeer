import type {Metadata} from "next";
import {ReactNode} from "react";

import "../globals.css";

import {AppProviders} from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "Panel administrativo | El Arca",
};

type Props = {
  children: ReactNode;
};

export default function AdminRootLayout({children}: Props) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AppProviders locale="es-MX">{children}</AppProviders>
      </body>
    </html>
  );
}
