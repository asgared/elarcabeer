"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text
} from "@chakra-ui/react";
import Link from "next/link";
import {useTranslations} from "next-intl";
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
  const currentLocale = segments[0];

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm" variant="outline">
        {localeLabels[currentLocale as keyof typeof localeLabels] ?? currentLocale}
      </MenuButton>
      <MenuList>
        {locales.map((locale) => {
          const nextHref = ["", locale, ...segments.slice(1)].join("/") || "/";

          return (
            <MenuItem as={Link} href={nextHref} key={locale}>
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

  return (
    <Box as="header" backdropFilter="blur(12px)" bg="rgba(12,27,30,0.85)" position="sticky" top={0} zIndex={1000}>
      <Container py={4}>
        <Flex align="center" justify="space-between" gap={4}>
          <HStack spacing={6}>
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
          <HStack spacing={3}>
            <LocaleSwitcher />
            <IconButton
              aria-label={t("cart")}
              icon={<FaCartShopping />}
              variant="outline"
              onClick={open}
            />
            {count > 0 ? (
              <Box
                aria-hidden
                bg="gold.500"
                borderRadius="full"
                color="black"
                fontSize="xs"
                fontWeight="bold"
                minW={5}
                px={2}
                textAlign="center"
                transform="translate(-18px, -10px)"
              >
                {count}
              </Box>
            ) : null}
            <IconButton aria-label={t("account") ?? "Cuenta"} as={Link} href="/account" icon={<FaUser />} variant="outline" />
            <IconButton
              aria-label="Menu"
              display={{base: "flex", md: "none"}}
              icon={<FaBars />}
              variant="ghost"
            />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
