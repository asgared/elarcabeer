"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";

import {Price} from "@/components/ui/price";
import {products} from "@/data/products";
import {selectCartTotal, useCartStore} from "@/stores/cart-store";
import {formatCurrency} from "@/utils/currency";

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore(selectCartTotal);
  const currency = useCartStore((state) => state.currency);

  return (
    <Container maxW="6xl" py={{base: 10, md: 16}}>
      <Heading size="2xl" mb={8} textAlign={{base: "center", lg: "left"}}>
        Checkout
      </Heading>
      <Grid gap={{base: 10, lg: 12}} templateColumns={{base: "1fr", lg: "3fr 2fr"}}>
        <GridItem>
          <Stack spacing={6}>
            <Box borderRadius="2xl" borderWidth="1px" p={6}>
              <Heading size="md" mb={4}>
                Datos de envío
              </Heading>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input placeholder="Tu nombre" />
                </FormControl>
                <FormControl>
                  <FormLabel>Dirección</FormLabel>
                  <Input placeholder="Calle, número, colonia" />
                </FormControl>
                <FormControl>
                  <FormLabel>Correo electrónico</FormLabel>
                  <Input placeholder="tu@email.com" type="email" />
                </FormControl>
              </Stack>
            </Box>
            <Box borderRadius="2xl" borderWidth="1px" p={6}>
              <Heading size="md" mb={4}>
                Métodos de pago
              </Heading>
              <Text color="whiteAlpha.700">
                Integración con Stripe lista. Configura STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET para habilitar pagos reales.
              </Text>
              <Button mt={6} size="lg" w={{base: "full", sm: "auto"}}>
                Pagar con Stripe
              </Button>
            </Box>
          </Stack>
        </GridItem>
        <GridItem>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md" mb={4}>
              Resumen de compra
            </Heading>
            <Stack spacing={4}>
              {items.map((item) => {
                const product = products.find((productItem) => productItem.id === item.productId);

                if (!product) return null;

                return (
                  <Box key={`${item.productId}-${item.variant.id}`}>
                    <Text fontWeight="semibold">{product.name}</Text>
                    <Text color="whiteAlpha.700">{item.variant.name}</Text>
                    <Text>{item.quantity} unidades</Text>
                    <Price amount={item.variant.price} />
                  </Box>
                );
              })}
            </Stack>
            <Stack mt={6} spacing={2}>
              <Text color="whiteAlpha.600">Total</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {formatCurrency(total, currency)}
              </Text>
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
