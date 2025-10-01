import type {Metadata} from "next";
import {ReactNode} from "react";

import {SiteShell} from "@/components/layout/site-shell";
import {AppProviders} from "@/providers/app-providers";
import {AppLocale, locales} from "@/i18n/locales";
import {IntlProvider} from "@/i18n/client";
import {loadMessages, resolveLocale} from "@/i18n/server";
import {getCmsContent} from "@/lib/cms";
import {notFound} from "next/navigation";

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
  const locale = resolveLocale(params.locale);
  const messages = await loadMessages(locale);
  const footerContent = await getCmsContent("site-footer");

  return (
    <IntlProvider locale={locale} messages={messages}>
      <AppProviders locale={locale}>
        <SiteShell
          footerContent={{
            subtitle: footerContent?.subtitle,
            socialLinks: footerContent?.socialLinks ?? []
          }}
        >
          {children}
        </SiteShell>
      </AppProviders>
    </IntlProvider>
  );
}
