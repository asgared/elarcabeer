import {Box, Container, Grid, Heading, Stack, Text} from "@chakra-ui/react";
import Link from "next/link";

export default function AccountPage() {
  return (
    <Container maxW="4xl">
      <Stack spacing={8}>
        <Heading size="2xl">Tu cuenta</Heading>
        <Grid gap={6} templateColumns={{base: "1fr", md: "repeat(2, minmax(0, 1fr))"}}>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md">
              <Link href="/account/orders">Órdenes</Link>
            </Heading>
            <Text color="whiteAlpha.700">Revisa historial y estado de entregas.</Text>
          </Box>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md">
              <Link href="/account/subscriptions">Suscripciones</Link>
            </Heading>
            <Text color="whiteAlpha.700">Gestiona tu Beer Club.</Text>
          </Box>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md">
              <Link href="/account/addresses">Direcciones</Link>
            </Heading>
            <Text color="whiteAlpha.700">Actualiza información de envío.</Text>
          </Box>
        </Grid>
      </Stack>
    </Container>
  );
}
