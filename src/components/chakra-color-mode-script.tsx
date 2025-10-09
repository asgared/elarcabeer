"use client";

import {ColorModeScript} from "@chakra-ui/react";

import {themeConfig} from "@/theme/config";

export function ChakraColorModeScript() {
  return <ColorModeScript initialColorMode={themeConfig.initialColorMode} />;
}
