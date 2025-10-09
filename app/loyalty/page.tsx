import {Container} from "@/components/ui/container";
import {Heading, List, ListItem, SimpleGrid, Stack, Text} from "@chakra-ui/react";

import {LoyaltyProgress as LoyaltyProgressComponent} from "@/components/ui/loyalty-progress";
import {loyaltyProgress, subscriptionPlans} from "@/data/subscriptions";

export default function LoyaltyPage() {
  return (
    <Container maxW="5xl">
      <Stack spacing={10}>
        <Stack spacing={2}>
          <Heading size="2xl">Arca Crew</Heading>
          <Text color="whiteAlpha.700">
            Gana puntos, desbloquea niveles y recibe beneficios exclusivos en cada travesía.
          </Text>
        </Stack>
        <LoyaltyProgressComponent progress={loyaltyProgress} />
        <SimpleGrid columns={{base: 1, md: 3}} gap={6}>
          {subscriptionPlans.map((plan) => (
            <Stack key={plan.id} borderRadius="2xl" borderWidth="1px" p={6} spacing={4}>
              <Heading size="md">{plan.name}</Heading>
              <Text fontSize="lg" fontWeight="bold">
                ${plan.price / 100} MXN / {plan.cadence === "monthly" ? "mes" : "trimestre"}
              </Text>
              <List spacing={2}>
                {plan.perks.map((perk) => (
                  <ListItem key={perk} color="whiteAlpha.700">
                    • {perk}
                  </ListItem>
                ))}
              </List>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
