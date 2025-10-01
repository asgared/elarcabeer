"use client";

import {Box, Button, Container, Heading, Stack, Text} from "@chakra-ui/react";
import Link from "next/link";

import {useAnalyticsContext} from "../../providers/analytics-provider";

type BrandHeroProps = {
  content?: {
    title?: string | null;
    subtitle?: string | null;
    body?: string | null;
    imageUrl?: string | null;
  };
};

export function BrandHero({content}: BrandHeroProps) {
  const analytics = useAnalyticsContext();

  const title = content?.title ?? "Cervezas artesanales inspiradas en travesías náuticas";
  const subtitle = content?.subtitle ?? "Navega el sabor";
  const description =
    content?.body ??
    "Explora estilos premiados, descubre nuestras tabernas marinas y únete al club exclusivo Arca Crew.";

  return (
    <Box
      bgGradient="linear(to-r, rgba(12,27,30,0.95), rgba(19,58,67,0.85))"
      borderRadius="3xl"
      overflow="hidden"
      position="relative"
      backgroundImage={content?.imageUrl ? `url(${content.imageUrl})` : undefined}
      backgroundSize="cover"
      backgroundPosition="center"
      _before={
        content?.imageUrl
          ? {
              content: '""',
              position: "absolute",
              inset: 0,
              bg: "rgba(12,27,30,0.75)"
            }
          : undefined
      }
    >
      <Container py={{base: 16, md: 24}} position="relative" zIndex={1}>
        <Stack maxW={{base: "100%", md: "60%"}} spacing={6}>
          <Text color="gold.500" fontWeight="semibold" letterSpacing="0.2em">
            {subtitle}
          </Text>
          <Heading size="2xl" fontFamily="var(--font-playfair)">
            {title}
          </Heading>
          <Text fontSize="lg" color="whiteAlpha.800">
            {description}
          </Text>
          <Stack direction={{base: "column", sm: "row"}} spacing={4}>
            <Button
              size="lg"
              as={Link}
              href="/shop"
              onClick={() => analytics.push({event: "select_promotion", location: "hero_shop"})}
            >
              Explorar catálogo
            </Button>
            <Button
              size="lg"
              variant="outline"
              as={Link}
              href="/loyalty"
              onClick={() => analytics.push({event: "select_promotion", location: "hero_loyalty"})}
            >
              Unirme al Arca Crew
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
