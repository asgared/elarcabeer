"use client";
import {ReactNode} from "react";
import {getCmsContent} from "@/lib/cms";
import {SiteShell} from "./site-shell";
type SiteAppLayoutProps = {
  children: ReactNode;
};
export async function SiteAppLayout({children}: SiteAppLayoutProps) {
  const footerContent = await getCmsContent("site-footer");
  return (
    <SiteShell
      footerContent={{
        subtitle: footerContent?.subtitle,
        socialLinks: footerContent?.socialLinks ?? [],
      }}
    >
      {children}
    </SiteShell>
  );
}
