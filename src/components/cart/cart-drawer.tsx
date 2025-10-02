"use client";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Stack,
  Text,
  useBreakpointValue
} from "@chakra-ui/react";
import type {DrawerProps} from "@chakra-ui/react";
import Link from "next/link";
import {FaMinus, FaPlus, FaTrash} from "react-icons/fa6";

import {products} from "../../data/products";
import {selectCartTotal, useCartStore} from "../../stores/cart-store";
import {formatCurrency} from "../../utils/currency";
import {useAnalyticsContext} from "../../providers/analytics-provider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartDrawer({isOpen, onClose}: Props) {
  const {items, removeItem, updateQuantity, clear, currency} = useCartStore();
  const total = useCartStore(selectCartTotal);
  const analytics = useAnalyticsContext();
  const drawerSize = useBreakpointValue<DrawerProps["size"]>({base: "full", md: "md"}) ?? "md";

  return (
    <Drawer isOpen={isOpen} placement="right" size={drawerSize} onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent bg="background.800">
        <DrawerHeader borderBottomWidth="1px">Tu Carrito</DrawerHeader>
        <DrawerBody>
          <Stack spacing={6}>
            {items.length === 0 ? (
              <Text color="whiteAlpha.600">Tu carrito está vacío por ahora.</Text>
            ) : (
              items.map((item) => {
                const product = products.find((productItem) => productItem.id === item.productId);

                if (!product) return null;

                return (
                  <Box key={`${item.productId}-${item.variant.id}`} borderBottomWidth="1px" pb={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      {product.name}
                    </Text>
                    <Text color="whiteAlpha.600">{item.variant.name}</Text>
                    <Stack align="center" direction="row" flexWrap="wrap" mt={3} spacing={3}>
                      <IconButton
                        aria-label="Disminuir"
                        icon={<FaMinus />}
                        size="md"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.productId, item.variant.id, item.quantity - 1)
                        }
                      />
                      <Text fontWeight="semibold">{item.quantity}</Text>
                      <IconButton
                        aria-label="Incrementar"
                        icon={<FaPlus />}
                        size="md"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.productId, item.variant.id, item.quantity + 1)
                        }
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<FaTrash />}
                        size="md"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeItem(item.productId, item.variant.id)}
                      />
                    </Stack>
                    <Text mt={2} fontWeight="bold">
                      {formatCurrency(item.variant.price * item.quantity, currency)}
                    </Text>
                  </Box>
                );
              })
            )}
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px" flexDir="column" alignItems="stretch" gap={4}>
          <HStack w="full" justify="space-between">
            <Text fontWeight="semibold">Total</Text>
            <Text fontSize="xl" fontWeight="bold">
              {formatCurrency(total, currency)}
            </Text>
          </HStack>
          <Stack w="full" spacing={3}>
            <Button
              as={Link}
              href="/checkout"
              onClick={() => {
                analytics.push({event: "begin_checkout", value: total});
                onClose();
              }}
            >
              Ir a checkout
            </Button>
            <Button variant="outline" onClick={() => clear()}>
              Vaciar carrito
            </Button>
          </Stack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
