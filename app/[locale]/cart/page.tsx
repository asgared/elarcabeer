"use client";

import {Button, Container, Heading, Stack, Text} from "@chakra-ui/react";

import {useCartDrawer} from "@/providers/cart-drawer-provider";

export default function CartPage() {
  const {open} = useCartDrawer();

  return (
    <Container maxW="3xl">
      <Stack spacing={6}>
        <Heading size="2xl">Tu carrito</Heading>
        <Text color="whiteAlpha.700">
          Gestiona los productos desde el panel lateral. Puedes abrirlo con el botón inferior.
        </Text>
        <Button size="lg" onClick={open}>
          Abrir carrito
        </Button>
      </Stack>
    </Container>
  );
}
