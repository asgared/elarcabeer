import {Container, Heading, Stack, Text} from "@chakra-ui/react";

export default function PrivacyPage() {
  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <Heading size="2xl">Aviso de privacidad</Heading>
        <Text color="whiteAlpha.700">
          Resguardamos tus datos conforme a la legislación mexicana. Utilizamos tu información únicamente para
          procesar pedidos, enviar comunicaciones del Arca Crew y mejorar nuestra experiencia digital.
        </Text>
      </Stack>
    </Container>
  );
}
