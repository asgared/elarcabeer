import {Box, Button, Container, Heading, Stack, Text} from "@chakra-ui/react";

import {subscriptionPlans} from "@/data/subscriptions";
import type {AppLocale} from "@/i18n/locales";
import {requireSupabaseSession} from "@/lib/supabase/require-session";

export const dynamic = "force-dynamic";

type AccountSubscriptionsPageProps = {
  params: {locale: AppLocale};
};

export default async function AccountSubscriptionsPage({params}: AccountSubscriptionsPageProps) {
  await requireSupabaseSession(params.locale);

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
