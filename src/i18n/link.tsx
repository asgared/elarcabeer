"use client";

import NextLink, {LinkProps as NextLinkProps} from "next/link";
import {forwardRef} from "react";

import type {AppLocale} from "./locales";
import {useLocale} from "./client";

type AnchorProps = React.ComponentPropsWithoutRef<"a">;

type LocaleLinkProps = NextLinkProps & AnchorProps & {locale?: AppLocale};

function addLocaleToHref(href: NextLinkProps["href"], locale: AppLocale): NextLinkProps["href"] {
  if (typeof href === "string") {
    if (!href.startsWith("/")) {
      return href;
    }

    const normalized = href === "/" ? "" : href;

    if (normalized.startsWith(`/${locale}`)) {
      return href;
    }

    return `/${locale}${normalized}`;
  }

  const pathname = href.pathname ?? "/";

  if (typeof pathname === "string" && pathname.startsWith("/")) {
    const normalizedPath = pathname === "/" ? "" : pathname;
    const finalPath = normalizedPath.startsWith(`/${locale}`)
      ? normalizedPath
      : `/${locale}${normalizedPath}`;

    return {...href, pathname: finalPath};
  }

  return href;
}

export const Link = forwardRef<HTMLAnchorElement, LocaleLinkProps>(function Link(
  {href, locale, ...rest},
  ref
) {
  const activeLocale = useLocale();
  const targetLocale = locale ?? activeLocale;
  const localizedHref = addLocaleToHref(href, targetLocale);

  return <NextLink ref={ref} href={localizedHref} {...rest} />;
});
