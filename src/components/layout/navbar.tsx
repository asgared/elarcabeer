"use client";

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton
} from "@chakra-ui/react";
import type {DrawerProps} from "@chakra-ui/react";
import {useBreakpointValue, useEffect, useState} from "react";
import {Link} from "@/i18n/navigation";
import {useTranslations, useLocale} from "@/i18n/client";
import {usePathname} from "next/navigation";
import {FaBars, FaCartShopping, FaChevronDown, FaUser} from "react-icons/fa6";

import {bundles} from "../../data/bundles";
import {products} from "../../data/products";
import {posts} from "../../data/posts";
import {useCartDrawer} from "../../providers/cart-drawer-provider";
import {selectCartCount, useCartStore} from "../../stores/cart-store";
import {localeLabels, locales} from "../../i18n/locales";

function LocaleSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const activeLocale = useLocale();

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm" variant="outline">
        {localeLabels[activeLocale]}
      </MenuButton>
      <MenuList>
        {locales.map((locale) => {
          const nextHref = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";

          return (
            <MenuItem as={Link} href={nextHref} key={locale} locale={locale}>
              {localeLabels[locale]}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

export function Navbar() {
  const t = useTranslations("navigation");
  const count = useCartStore(selectCartCount);
  const {open} = useCartDrawer();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [isClient, setIsClient] = useState(false);
  const drawerSize = useBreakpointValue<DrawerProps["size"]>({base: "full", md: "xs"}) ?? "xs";

  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return null;
  }

  const shouldShowCartCount = isClient && count > 0;

  return (
    <Box as="header" backdropFilter="blur(12px)" bg="rgba(12,27,30,0.85)" position="sticky" top={0} zIndex={1000}>
      <Container maxW="6xl" py={4}>
        <Flex align="center" justify="space-between" flexWrap="wrap" gap={{base: 3, md: 4}}>
          <HStack spacing={{base: 3, md: 6}}>
            <Link href="/" style={{fontWeight: 700, fontSize: "1.125rem"}}>
              El Arca
            </Link>
            <HStack display={{base: "none", md: "flex"}} spacing={6}>
              <Menu isLazy>
                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost">
                  {t("shop")}
                </MenuButton>
                <MenuList bg="background.800">
                  {products.slice(0, 4).map((product) => (
                    <MenuItem key={product.id} as={Link} href={`/shop/${product.slug}`}>
                      {product.name}
                    </MenuItem>
                  ))}
                  <MenuItem as={Link} href="/bundles/crew-welcome-pack">
                    Bundles destacados
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button as={Link} href="/bars" variant="ghost">
                {t("bars")}
              </Button>
              <Menu isLazy>
                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost">
                  {t("discover")}
                </MenuButton>
                <MenuList bg="background.800">
                  {posts.map((post) => (
                    <MenuItem key={post.id} as={Link} href={`/discover/${post.slug}`}>
                      {post.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Button as={Link} href="/loyalty" variant="ghost">
                {t("loyalty")}
              </Button>
            </HStack>
          </HStack>
          <HStack spacing={{base: 2, md: 3}}>
            <LocaleSwitcher />
            <Box position="relative">
              <IconButton
                aria-label={t("cart")}
                icon={<FaCartShopping />}
                minH={12}
                minW={12}
                variant="outline"
                onClick={open}
              />
              {shouldShowCartCount ? (
                <Box
                  aria-hidden
                  bg="gold.500"
                  borderRadius="full"
                  color="black"
                  fontSize="xs"
                  fontWeight="bold"
                  minW={5}
                  px={1.5}
                  position="absolute"
                  right={1}
                  textAlign="center"
                  top={1}
                >
                  {count}
                </Box>
              ) : null}
            </Box>
            <IconButton
              aria-label={t("account") ?? "Cuenta"}
              as={Link}
              href="/account"
              icon={<FaUser />}
              minH={12}
              minW={12}
              variant="outline"
            />
            <IconButton
              aria-label="Menu"
              display={{base: "flex", md: "none"}}
              icon={<FaBars />}
              variant="ghost"
              onClick={onOpen}
            />
          </HStack>
        </Flex>
      </Container>
      <Drawer isOpen={isOpen} placement="left" size={drawerSize} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="background.900">
          <DrawerCloseButton mt={2} />
          <DrawerHeader>El Arca</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4}>
              <Button as={Link} href="/shop" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                {t("shop")}
              </Button>
              <Button as={Link} href="/bars" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                {t("bars")}
              </Button>
              <Button as={Link} href="/discover" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                {t("discover")}
              </Button>
              <Button as={Link} href="/loyalty" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                {t("loyalty")}
              </Button>
              <Divider borderColor="whiteAlpha.300" />
              <LocaleSwitcher />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
