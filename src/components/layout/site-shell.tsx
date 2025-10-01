"use client";

import {Box} from "@chakra-ui/react";
import {ReactNode} from "react";

import type {SocialLink} from "@/types/cms";

import {Footer} from "./footer";
import {Navbar} from "./navbar";

type SiteShellProps = {
  children: ReactNode;
  footerContent?: {
    subtitle?: string | null;
    socialLinks?: SocialLink[] | null;
  };
};

export function SiteShell({children, footerContent}: SiteShellProps) {
  return (
    <Box minH="100vh" display="flex" flexDir="column">
      <Navbar />
      <Box as="main" flex="1" py={12}>
        {children}
      </Box>
      <Footer subtitle={footerContent?.subtitle} socialLinks={footerContent?.socialLinks ?? []} />
    </Box>
  );
}
