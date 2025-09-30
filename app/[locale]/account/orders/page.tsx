"use client";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text
} from "@chakra-ui/react";
import {useEffect} from "react";

import {useUser} from "@/providers/user-provider";
import {formatCurrency} from "@/utils/currency";

export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<string, string> = {
  fulfilled: "Completado",
  delivered: "Entregado",
  processing: "Procesando",
  pending: "Pendiente",
  cancelled: "Cancelado"
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  fulfilled: "green",
  delivered: "green",
  processing: "yellow",
  pending: "orange",
  cancelled: "red"
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  failed: "Fallido",
  refunded: "Reembolsado"
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "green",
  pending: "orange",
  failed: "red",
  refunded: "purple"
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {dateStyle: "long", timeStyle: "short"});

export default function OrdersPage() {
  const {user, status, refreshUser} = useUser();

  useEffect(() => {
    if (user) {
      void refreshUser();
    }
  }, [refreshUser, user?.id]);

  const isLoading = status === "initializing" || (status === "loading" && !user);

  if (isLoading) {
    return (
      <Container maxW="4xl">
        <Stack align="center" py={12} spacing={4}>
          <Spinner size="xl" thickness="4px" />
          <Text color="whiteAlpha.700">Cargando historial de órdenes...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="4xl">
        <Stack spacing={6}>
          <Heading size="2xl">Órdenes</Heading>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Text color="whiteAlpha.700">
              Inicia sesión o crea una cuenta para consultar el detalle de tus compras y pagos.
            </Text>
          </Box>
        </Stack>
      </Container>
    );
  }

  const orders = user.orders;

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <Heading size="2xl">Órdenes</Heading>
        {orders.length === 0 ? (
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Text color="whiteAlpha.700">Aún no has realizado compras. Tu historial aparecerá aquí.</Text>
          </Box>
        ) : (
          <Accordion allowMultiple defaultIndex={[0]}>
            {orders.map((order) => {
              const statusKey = order.status.toLowerCase();
              const statusLabel = ORDER_STATUS_LABELS[statusKey] ?? order.status;
              const statusColor = ORDER_STATUS_COLORS[statusKey] ?? "gray";

              return (
                <AccordionItem key={order.id} border="none">
                  <h3>
                    <AccordionButton px={0} py={4}>
                      <Flex flex="1" direction="column" alignItems="flex-start" gap={1} textAlign="left">
                        <Text fontWeight="bold">{order.number}</Text>
                        <Text color="whiteAlpha.700">{dateFormatter.format(new Date(order.createdAt))}</Text>
                      </Flex>
                      <Stack align="flex-end" direction="column" spacing={2} pr={2}>
                        <Badge colorScheme={statusColor}>{statusLabel}</Badge>
                        <Text fontWeight="semibold">{formatCurrency(order.total)}</Text>
                      </Stack>
                      <AccordionIcon />
                    </AccordionButton>
                  </h3>
                  <AccordionPanel px={0} pt={4} pb={8}>
                    <Stack spacing={6}>
                      <Stack spacing={2}>
                        <Heading size="sm">Artículos</Heading>
                        {order.items.map((item) => (
                          <Flex key={item.id} justify="space-between">
                            <Text>{item.name}</Text>
                            <Stack direction="row" spacing={6} align="center">
                              <Text color="whiteAlpha.700">x{item.quantity}</Text>
                              <Text fontWeight="medium">{formatCurrency(item.price * item.quantity)}</Text>
                            </Stack>
                          </Flex>
                        ))}
                      </Stack>

                      <Divider />

                      <Stack spacing={2}>
                        <Heading size="sm">Pagos</Heading>
                        {order.payments.length === 0 ? (
                          <Text color="whiteAlpha.700">Pago pendiente por procesar.</Text>
                        ) : (
                          order.payments.map((payment) => {
                            const paymentKey = payment.status.toLowerCase();
                            const paymentLabel = PAYMENT_STATUS_LABELS[paymentKey] ?? payment.status;
                            const paymentColor = PAYMENT_STATUS_COLORS[paymentKey] ?? "gray";

                            return (
                              <Box key={payment.id} borderRadius="lg" borderWidth="1px" p={4}>
                                <Stack direction={{base: "column", md: "row"}} justify="space-between" spacing={3}>
                                  <Stack spacing={1}>
                                    <Text fontWeight="medium">{formatCurrency(payment.amount)}</Text>
                                    <Text color="whiteAlpha.700">{dateFormatter.format(new Date(payment.processedAt))}</Text>
                                  </Stack>
                                  <Stack align={{base: "flex-start", md: "flex-end"}} spacing={1}>
                                    <Badge alignSelf="flex-start" colorScheme={paymentColor}>
                                      {paymentLabel}
                                    </Badge>
                                    <Text color="whiteAlpha.700">Método: {payment.method}</Text>
                                  </Stack>
                                </Stack>
                              </Box>
                            );
                          })
                        )}
                      </Stack>
                    </Stack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </Stack>
    </Container>
  );
}
