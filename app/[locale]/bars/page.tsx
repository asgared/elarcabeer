"use client";

import {
  Badge,
  Box,
  Checkbox,
  Container,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import Link from "next/link";
import {useMemo, useState} from "react";

import {StoreMap} from "@/components/ui/store-map";
import {stores} from "@/data/stores";
import type {Store} from "@/types/catalog";

export default function BarsPage() {
  const [petFriendly, setPetFriendly] = useState(false);
  const [kitchen, setKitchen] = useState(false);
  const [events, setEvents] = useState(false);

  const filtered = useMemo<Store[]>(() => {
    return stores.filter((store) => {
      if (petFriendly && !store.petFriendly) return false;
      if (kitchen && !store.kitchen) return false;
      if (events && !store.events) return false;
      return true;
    });
  }, [petFriendly, kitchen, events]);

  return (
    <Container maxW="6xl">
      <Stack spacing={10}>
        <Stack spacing={2}>
          <Heading size="2xl">Bares & taprooms</Heading>
          <Text color="whiteAlpha.700">
            Navega por nuestros espacios físicos, agenda una reservación y descubre eventos especiales.
          </Text>
        </Stack>
        <StoreMap stores={filtered} />
        <HStack spacing={6}>
          <Checkbox isChecked={petFriendly} onChange={(event) => setPetFriendly(event.target.checked)}>
            Pet friendly
          </Checkbox>
          <Checkbox isChecked={kitchen} onChange={(event) => setKitchen(event.target.checked)}>
            Cocina propia
          </Checkbox>
          <Checkbox isChecked={events} onChange={(event) => setEvents(event.target.checked)}>
            Eventos
          </Checkbox>
        </HStack>
        <SimpleGrid columns={{base: 1, md: 2}} gap={8}>
          {filtered.map((store) => (
            <Box key={store.id} borderRadius="2xl" borderWidth="1px" p={6}>
              <Stack spacing={2}>
                <Heading size="md">{store.name}</Heading>
                <Text color="whiteAlpha.600">{store.address}</Text>
                <Text color="whiteAlpha.600">{store.hours}</Text>
                <HStack spacing={3}>
                  {store.petFriendly ? <Badge colorScheme="teal">Pet friendly</Badge> : null}
                  {store.kitchen ? <Badge colorScheme="gold">Cocina</Badge> : null}
                  {store.events ? <Badge colorScheme="purple">Eventos</Badge> : null}
                </HStack>
                <Stack spacing={1}>
                  <Text fontWeight="semibold">Próximos eventos</Text>
                  {store.upcomingEvents.map((event) => (
                    <Text key={event} color="whiteAlpha.700">
                      • {event}
                    </Text>
                  ))}
                </Stack>
                <HStack spacing={4}>
                  {store.menuUrl ? (
                    <Text as={Link} href={store.menuUrl} target="_blank">
                      Ver menú
                    </Text>
                  ) : null}
                  <Text as={Link} href={`/bars/${store.slug}`}>
                    Reservar
                  </Text>
                </HStack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
