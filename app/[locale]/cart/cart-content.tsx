"use client";

import {Button, Container, Heading, Stack, Text} from "@chakra-ui/react";

import {useCartDrawer} from "@/providers/cart-drawer-provider";

export function CartContent() {
  const {open} = useCartDrawer();

  return (
    <Container maxW="3xl" py={{base: 10, md: 16}}>
      <Stack
        align={{base: "stretch", md: "flex-start"}}
        spacing={6}
        textAlign={{base: "center", md: "left"}}
      >
        <Heading size="2xl">Tu carrito</Heading>
        <Text color="whiteAlpha.700">
          Gestiona los productos desde el panel lateral. Puedes abrirlo con el botón inferior.
        </Text>
        <Button size="lg" w={{base: "full", sm: "auto"}} onClick={open}>
          Abrir carrito
        </Button>
      </Stack>
    </Container>
  );
}
