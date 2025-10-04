"use client";

import {
  Box,
  Container,
  Grid,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text
} from "@chakra-ui/react";

import {AccountAccessPanel} from "@/components/account/account-access";
import {ProfileForm} from "@/components/account/profile-form";
import {Link} from "@/i18n/navigation";
import {useUser} from "@/providers/user-provider";
import {formatCurrency} from "@/utils/currency";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  const {user, status} = useUser();

  const isLoading = status === "initializing" || (status === "loading" && !user);

  const completedStatuses = new Set(["fulfilled", "delivered", "completed"]);
  const totalOrders = user?.orders?.length ?? 0;
  const totalSpent =
    user?.orders?.reduce((sum, order) => {
      if (completedStatuses.has(order.status.toLowerCase())) {
        return sum + order.total;
      }

      return sum;
    }, 0) ?? 0;
  const loyaltyPoints = user?.loyalty?.reduce((sum, entry) => sum + entry.points, 0) ?? 0;
  const activeSubscriptions =
    user?.subscriptions?.filter((subscription) => subscription.status === "active")?.length ?? 0;

  return (
    <Container maxW="5xl">
      <Stack spacing={10}>
        <Stack spacing={3}>
          <Heading size="2xl">Tu cuenta</Heading>
          {user ? (
            <Text color="whiteAlpha.700">Bienvenida, {user.name ?? user.email}. Gestiona tu perfil y tus pedidos recientes.</Text>
          ) : (
            <Text color="whiteAlpha.700">Crea una cuenta o inicia sesión para seguir tus compras, pagos y direcciones favoritas.</Text>
          )}
        </Stack>

        {isLoading && (
          <Stack align="center" py={12}>
            <Spinner size="xl" thickness="4px" />
            <Text color="whiteAlpha.700">Cargando tu información...</Text>
          </Stack>
        )}

        {!user && !isLoading && <AccountAccessPanel />}

        {user && !isLoading && (
          <Stack spacing={10}>
            <SimpleGrid columns={{base: 1, md: 4}} spacing={4}>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Stat>
                  <StatLabel>Órdenes totales</StatLabel>
                  <StatNumber>{totalOrders}</StatNumber>
                </Stat>
              </Box>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Stat>
                  <StatLabel>Gasto acumulado</StatLabel>
                  <StatNumber>{formatCurrency(totalSpent)}</StatNumber>
                </Stat>
              </Box>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Stat>
                  <StatLabel>Puntos de lealtad</StatLabel>
                  <StatNumber>{loyaltyPoints}</StatNumber>
                </Stat>
              </Box>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Stat>
                  <StatLabel>Suscripciones activas</StatLabel>
                  <StatNumber>{activeSubscriptions}</StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>

            <Grid gap={6} templateColumns={{base: "1fr", md: "repeat(3, minmax(0, 1fr))"}}>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Heading size="md">
                  <Link href="/account/orders">Órdenes y pagos</Link>
                </Heading>
                <Text color="whiteAlpha.700">Revisa el detalle de tus compras, pagos y entregas.</Text>
              </Box>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Heading size="md">
                  <Link href="/account/subscriptions">Suscripciones</Link>
                </Heading>
                <Text color="whiteAlpha.700">Gestiona tus membresías del Beer Club.</Text>
              </Box>
              <Box borderRadius="2xl" borderWidth="1px" p={6}>
                <Heading size="md">
                  <Link href="/account/addresses">Direcciones</Link>
                </Heading>
                <Text color="whiteAlpha.700">Mantén al día tus direcciones de entrega favoritas.</Text>
              </Box>
            </Grid>

            <ProfileForm />
          
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
