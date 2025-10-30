// app/providers.tsx (Simplificado)
"use client";

import dynamic from "next/dynamic";
import { ReactNode, useMemo } from "react";

import {Toaster} from "@/components/ui/toaster";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import { CartDrawerProvider } from "@/providers/cart-drawer-provider";
import { UserProvider } from "@/providers/UserProvider"; // Asegúrate que la ruta sea correcta
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import seoConfig from "../next-seo.config";

const DefaultSeo = dynamic(
  () => import("next-seo").then((mod) => ({ default: mod.DefaultSeo })),
  { ssr: false }
);

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <>
      <DefaultSeo {...seoConfig} />
      <AnalyticsProvider>
        <UserProvider supabaseClient={supabaseClient}>
          <CartDrawerProvider>
            {children}
            <Toaster />
          </CartDrawerProvider>
        </UserProvider>
      </AnalyticsProvider>
    </>
  );
}
