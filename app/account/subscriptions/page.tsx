"use client";

import {Container} from "@/components/ui/container";
import {Badge, Box, Button, Heading, Spinner, Stack, Text} from "@chakra-ui/react";

import {useUser} from "@/providers/user-provider";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  canceled: "Cancelada",
  paused: "Pausada",
  incomplete: "Incompleta"
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "green",
  canceled: "red",
  paused: "orange",
  incomplete: "yellow"
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {dateStyle: "long"});

export default function AccountSubscriptionsPage() {
  const {user, status} = useUser();

  const isLoading = status === "initializing" || (status === "loading" && !user);

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <Heading size="2xl">Suscripciones</Heading>

        {isLoading && (
          <Stack align="center" py={12} spacing={4}>
            <Spinner size="xl" thickness="4px" />
            <Text color="whiteAlpha.700">Cargando tus suscripciones...</Text>
          </Stack>
        )}

        {!user && !isLoading && (
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Text color="whiteAlpha.700">Inicia sesión para consultar o gestionar tus suscripciones activas.</Text>
          </Box>
        )}

        {user && !isLoading && (
          <Stack spacing={4}>
            {user.subscriptions.length === 0 ? (
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Text color="whiteAlpha.700">Aún no tienes suscripciones activas.</Text>
              </Box>
            ) : (
              user.subscriptions.map((subscription) => {
                const statusKey = subscription.status.toLowerCase();
                const statusLabel = SUBSCRIPTION_STATUS_LABELS[statusKey] ?? subscription.status;
                const statusColor = SUBSCRIPTION_STATUS_COLORS[statusKey] ?? "gray";

                return (
                  <Box key={subscription.id} borderRadius="2xl" borderWidth="1px" p={6}>
                    <Stack spacing={2}>
                      <Stack direction={{base: "column", md: "row"}} justify="space-between" align="flex-start">
                        <Text fontWeight="bold">Plan: {subscription.plan}</Text>
                        <Badge colorScheme={statusColor}>{statusLabel}</Badge>
                      </Stack>
                      <Text color="whiteAlpha.700">
                        Activada el {dateFormatter.format(new Date(subscription.createdAt))}
                      </Text>
                      <Text color="whiteAlpha.700">Gestiona cambios o cancelaciones desde el portal de pagos.</Text>
                      <Button mt={4} variant="outline" isDisabled>
                        Gestionar en Stripe Billing
                      </Button>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
