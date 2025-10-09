import {extendTheme} from "@chakra-ui/react";
import type {StyleFunctionProps} from "@chakra-ui/react";

import {themeConfig} from "./config";

const brandPalette = {
  50: "#0C1B1E",
  100: "#10272D",
  200: "#133A43",
  300: "#1F515C",
  400: "#2B6B77",
  500: "#35A3B3",
  600: "#4BC0CD",
  700: "#6FD6E0",
  800: "#9AE7EE",
  900: "#D6F8FB"
};

export const theme = extendTheme({
  config: themeConfig,
  fonts: {
    heading: "var(--font-playfair)",
    body: "var(--font-inter)"
  },
  colors: {
    brand: brandPalette,
    gold: {
      500: "#C6A15B"
    },
    sand: {
      500: "#DCC9A6"
    },
    background: {
      900: "#0C1B1E",
      800: "#10272D"
    }
  },
  styles: {
    global: ({colorMode}: StyleFunctionProps) => ({
      body: {
        bg: colorMode === "dark" ? "background.900" : "sand.500",
        color: "whiteAlpha.900",
        fontFamily: "var(--font-inter)",
        scrollBehavior: "smooth"
      }
    })
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "600",
        letterSpacing: "0.04em"
      },
      variants: {
        solid: {
          bg: "brand.400",
          color: "#0C1B1E",
          _hover: {bg: "brand.500"},
          _active: {bg: "brand.300"}
        },
        outline: {
          borderColor: "brand.400",
          color: "brand.400",
          _hover: {bg: "rgba(53,163,179,0.12)"}
        }
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: "sm",
        textTransform: "uppercase",
        letterSpacing: "0.08em"
      },
      variants: {
        solid: {
          bg: "gold.500",
          color: "#0C1B1E"
        },
        outline: {
          borderColor: "gold.500",
          color: "gold.500"
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: "rgba(19,58,67,0.75)",
          backdropFilter: "blur(12px)",
          borderRadius: "xl",
          borderWidth: "1px",
          borderColor: "rgba(53,163,179,0.3)",
          boxShadow: "0 20px 45px rgba(12,27,30,0.55)"
        }
      }
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: "background.800",
          color: "whiteAlpha.900"
        }
      }
    },
    Alert: {
      baseStyle: {
        container: {
          borderRadius: "md"
        }
      }
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "lg",
          bg: "rgba(12,27,30,0.6)",
          borderWidth: "1px",
          borderColor: "rgba(53,163,179,0.2)",
          _focus: {
            borderColor: "brand.400",
            boxShadow: "0 0 0 1px rgba(53,163,179,0.6)"
          }
        }
      }
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "lg",
          bg: "rgba(12,27,30,0.6)"
        }
      }
    },
    Tabs: {
      baseStyle: {
        tab: {
          fontWeight: "600",
          letterSpacing: "0.05em"
        }
      },
      variants: {
        "soft-rounded": {
          tab: {
            color: "whiteAlpha.700",
            _selected: {
              bg: "brand.400",
              color: "#0C1B1E"
            }
          }
        }
      }
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "background.800",
          borderColor: "rgba(53,163,179,0.3)"
        }
      }
    },
    Breadcrumb: {
      baseStyle: {
        link: {
          color: "whiteAlpha.700",
          _hover: {color: "white"}
        }
      }
    }
  }
});

export type Theme = typeof theme;
