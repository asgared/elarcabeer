"use client";

import {useEffect} from "react";

import {Container} from "@/components/ui/container";
import {Box, Button, Heading, Stack, Text} from "@chakra-ui/react";
import {useSearchParams} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {useCartStore} from "@/stores/cart-store";

export default function OrderSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Container maxW="4xl" py={{base: 16, md: 24}}>
      <Stack spacing={8} align="center" textAlign="center">
        <Heading size="2xl">¡Gracias por tu compra!</Heading>
        <Text fontSize="lg" color="gray.600">
          Tu pago se ha procesado correctamente y estamos preparando tu pedido.
        </Text>
        {sessionId ? (
          <Box borderWidth="1px" borderRadius="lg" px={6} py={4} bg="gray.50">
            <Text fontSize="sm" color="gray.500">
              Número de confirmación
            </Text>
            <Text fontWeight="semibold" fontSize="lg" mt={1} wordBreak="break-all">
              {sessionId}
            </Text>
          </Box>
        ) : null}
        <Button as={Link} href="/shop" colorScheme="teal" size="lg">
          Seguir explorando cervezas
        </Button>
      </Stack>
    </Container>
  );
}
