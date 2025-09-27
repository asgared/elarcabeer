import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {ReactNode} from "react";

import {SiteShell} from "@/components/layout/site-shell";
import {AppProviders} from "@/providers/app-providers";
import {AppLocale, locales} from "@/i18n/locales";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

type LayoutProps = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata({params}: LayoutProps): Promise<Metadata> {
  const locale = params.locale as AppLocale;

  if (!locales.includes(locale)) {
    notFound();
  }

  return {
    metadataBase: new URL("https://elarca.mx"),
    title: {
      default: "El Arca Cervecería",
      template: "%s | El Arca"
    },
    description: "Cervezas artesanales inspiradas en travesías marítimas",
    openGraph: {
      title: "El Arca Cervecería",
      description: "Cervezas artesanales inspiradas en travesías marítimas",
      locale,
      siteName: "El Arca Beer"
    }
  };
}

export default async function LocaleLayout({children, params}: LayoutProps) {
  const locale = params.locale as AppLocale;

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const supabase = createSupabaseServerClient();
  const {
    data: {session}
  } = await supabase.auth.getSession();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders
        initialSession={session}
        locale={locale}
        serverAccessToken={session?.access_token ?? undefined}
      >
        <SiteShell>{children}</SiteShell>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
