import type {Metadata} from "next";
import {ReactNode} from "react";
import dynamic from "next/dynamic";

import "../globals.css";

const ClientProviders = dynamic(() => import("@/providers/client-providers"), {
  ssr: false,
});

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
        <ClientProviders locale="es-MX">{children}</ClientProviders>
      </body>
    </html>
  );
}
