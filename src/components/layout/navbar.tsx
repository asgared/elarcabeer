"use client";

import {Container} from "@/components/ui/container";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
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
  DrawerCloseButton,
  useBreakpointValue
} from "@chakra-ui/react";
import type {DrawerProps} from "@chakra-ui/react";
import NextLink from "next/link";
import {useEffect, useState} from "react";
import {FaBars, FaCartShopping, FaChevronDown, FaUser} from "react-icons/fa6";

import {products} from "../../data/products";
import {posts} from "../../data/posts";
import {useCartDrawer} from "../../providers/cart-drawer-provider";
import {selectCartCount, useCartStore} from "../../stores/cart-store";
import {useUser} from "@/providers/user-provider";

export function Navbar() {
  const count = useCartStore(selectCartCount);
  const {open} = useCartDrawer();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [isClient, setIsClient] = useState(false);
  const {user, logout} = useUser();
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
            <NextLink href="/" style={{fontWeight: 700, fontSize: "1.125rem"}}>
              El Arca
            </NextLink>
            <HStack display={{base: "none", md: "flex"}} spacing={6}>
              <Menu isLazy>
                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost">
                  Tienda
                </MenuButton>
                <MenuList bg="background.800">
                  {products.slice(0, 4).map((product) => (
                    <MenuItem key={product.id} as={NextLink} href={`/shop/${product.slug}`}>
                      {product.name}
                    </MenuItem>
                  ))}
                  <MenuItem as={NextLink} href="/bundles/crew-welcome-pack">
                    Bundles destacados
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button as={NextLink} href="/bars" variant="ghost">
                Bares
              </Button>
              <Menu isLazy>
                <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="ghost">
                  Descubre
                </MenuButton>
                <MenuList bg="background.800">
                  {posts.map((post) => (
                    <MenuItem key={post.id} as={NextLink} href={`/discover/${post.slug}`}>
                      {post.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Button as={NextLink} href="/loyalty" variant="ghost">
                Lealtad
              </Button>
            </HStack>
          </HStack>
          <HStack spacing={{base: 2, md: 3}}>
            <Box position="relative">
              <IconButton
                aria-label="Abrir carrito"
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
            {user ? (
              <Menu placement="bottom-end" isLazy>
                <MenuButton
                  as={Button}
                  borderRadius="full"
                  minW={0}
                  p={0}
                  variant="outline"
                >
                  <Avatar
                    size="sm"
                    name={user.name ?? user.email}
                    bg="gold.500"
                    color="black"
                  />
                </MenuButton>
                <MenuList bg="background.800" minW="220px">
                  <Box px={4} py={3} borderBottomWidth="1px" borderColor="whiteAlpha.200">
                    <Text fontWeight="semibold" noOfLines={1}>
                      {user.name ?? user.email}
                    </Text>
                    {user.name ? (
                      <Text color="whiteAlpha.700" fontSize="sm" noOfLines={1}>
                        {user.email}
                      </Text>
                    ) : null}
                  </Box>
                  <MenuDivider borderColor="whiteAlpha.200" />
                  <MenuItem as={NextLink} href="/account">
                    Perfil
                  </MenuItem>
                  <MenuItem onClick={logout}>Cerrar sesión</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <IconButton
                aria-label="Cuenta"
                as={NextLink}
                href="/account"
                icon={<FaUser />}
                minH={12}
                minW={12}
                variant="outline"
              />
            )}
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
              <Button as={NextLink} href="/shop" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                Tienda
              </Button>
              <Button as={NextLink} href="/bars" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                Bares
              </Button>
              <Button as={NextLink} href="/discover" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                Descubre
              </Button>
              <Button as={NextLink} href="/loyalty" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                Lealtad
              </Button>
              <Divider borderColor="whiteAlpha.300" />
              <Button as={NextLink} href="/account" justifyContent="flex-start" variant="ghost" onClick={onClose}>
                Cuenta
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
