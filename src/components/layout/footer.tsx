"use client";

import {Box, Container, HStack, Link, Stack, Text} from "@chakra-ui/react";

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" mt={16} py={12}>
      <Container>
        <Stack direction={{base: "column", md: "row"}} justify="space-between" spacing={6}>
          <Stack spacing={2}>
            <Text fontWeight="bold">El Arca Cervecería</Text>
            <Text color="whiteAlpha.600">Cervezas artesanales desde 2015</Text>
          </Stack>
          <HStack spacing={6}>
            <Link href="/legal/privacy">Privacidad</Link>
            <Link href="/legal/terms">Términos</Link>
            <Link href="/legal/shipping">Envíos</Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
