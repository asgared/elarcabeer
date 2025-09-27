import {Box, Container, Grid, Heading, Stack, Text} from "@chakra-ui/react";
import {Link} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/locales";
import {requireSupabaseSession} from "@/lib/supabase/require-session";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  params: {locale: AppLocale};
};

export default async function AccountPage({params}: AccountPageProps) {
  const session = await requireSupabaseSession(params.locale);
  const identifier = session.user.email ?? session.user.phone ?? "tripulante";

  return (
    <Container maxW="4xl">
      <Stack spacing={8}>
        <Heading size="2xl">Tu cuenta</Heading>
        <Text color="whiteAlpha.700">Sesión iniciada como {identifier}</Text>
        <Grid gap={6} templateColumns={{base: "1fr", md: "repeat(2, minmax(0, 1fr))"}}>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md">
              <Link href="./orders">Órdenes</Link>
            </Heading>
            <Text color="whiteAlpha.700">Revisa historial y estado de entregas.</Text>
          </Box>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md">
              <Link href="./subscriptions">Suscripciones</Link>
            </Heading>
            <Text color="whiteAlpha.700">Gestiona tu Beer Club.</Text>
          </Box>
          <Box borderRadius="2xl" borderWidth="1px" p={6}>
            <Heading size="md">
              <Link href="./addresses">Direcciones</Link>
            </Heading>
            <Text color="whiteAlpha.700">Actualiza información de envío.</Text>
          </Box>
        </Grid>
      </Stack>
    </Container>
  );
}
