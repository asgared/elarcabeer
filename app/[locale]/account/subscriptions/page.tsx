import {Box, Button, Container, Heading, Stack, Text} from "@chakra-ui/react";

import {subscriptionPlans} from "@/data/subscriptions";

export const dynamic = "force-dynamic";

export default function AccountSubscriptionsPage() {
  const activePlan = subscriptionPlans[1];

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <Heading size="2xl">Suscripciones</Heading>
        <Box borderRadius="2xl" borderWidth="1px" p={6}>
          <Text fontWeight="bold">Plan activo: {activePlan.name}</Text>
          <Text color="whiteAlpha.700">Renueva cada mes</Text>
          <Text color="whiteAlpha.700">Beneficios: {activePlan.perks.join(", ")}</Text>
          <Button mt={4} variant="outline">
            Gestionar en Stripe Billing
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
