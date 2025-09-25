import {Box, Container, Heading, Stack, Text} from "@chakra-ui/react";
import {Metadata} from "next";
import {notFound} from "next/navigation";

import {stores} from "@/data/stores";
import type {Store} from "@/types/catalog";

const getStore = (slug: string): Store | undefined =>
  stores.find((store) => store.slug === slug);

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  const store = getStore(params.slug);

  if (!store) {
    return {title: "Bar no encontrado"};
  }

  return {
    title: store.name,
    description: store.address
  };
}

export default function StorePage({params}: {params: {slug: string}}) {
  const store = getStore(params.slug);

  if (!store) {
    notFound();
  }

  return (
    <Container maxW="4xl">
      <Stack spacing={8}>
        <Stack spacing={2}>
          <Heading size="2xl">{store.name}</Heading>
          <Text color="whiteAlpha.700">{store.address}</Text>
          <Text color="whiteAlpha.700">{store.hours}</Text>
        </Stack>
        <Box borderRadius="2xl" borderWidth="1px" overflow="hidden" p={0}>
          <iframe
            allowFullScreen
            height="480"
            src="https://calendly.com/elarca/visit?hide_gdpr_banner=1"
            style={{border: "none", width: "100%"}}
            title="Reservar mesa"
          />
        </Box>
        <Stack spacing={3}>
          <Heading size="md">Próximos eventos</Heading>
          {store.upcomingEvents.map((event) => (
            <Text key={event} color="whiteAlpha.800">
              • {event}
            </Text>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
