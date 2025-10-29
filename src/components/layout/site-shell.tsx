"use client";

import dynamic from "next/dynamic";
import {type ReactNode} from "react";

import type {SocialLink} from "@/types/cms";
import {Footer} from "./footer";

const Navbar = dynamic(
  () => import("./navbar").then((mod) => mod.Navbar),
  {ssr: false}
);

type SiteShellProps = {
  children: ReactNode;
  footerContent?: {
    subtitle?: string | null;
    socialLinks?: SocialLink[] | null;
  };
};

export function SiteShell({children, footerContent}: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">{children}</main>
      <Footer subtitle={footerContent?.subtitle} socialLinks={footerContent?.socialLinks ?? []} />
    </div>
  );
}
