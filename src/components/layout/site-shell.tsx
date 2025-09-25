"use client";

import {Box} from "@chakra-ui/react";
import {ReactNode} from "react";

import {Footer} from "./footer";
import {Navbar} from "./navbar";

export function SiteShell({children}: {children: ReactNode}) {
  return (
    <Box minH="100vh" display="flex" flexDir="column">
      <Navbar />
      <Box as="main" flex="1" py={12}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
