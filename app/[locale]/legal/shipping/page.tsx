import {Container, Heading, Stack, Text} from "@chakra-ui/react";

export default function ShippingPage() {
  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <Heading size="2xl">Política de envíos</Heading>
        <Text color="whiteAlpha.700">
          Enviamos a todo México desde CDMX. Calculamos tarifas de envío según peso y destino. Los pedidos se procesan en 24h
          y se entregan en 2-5 días hábiles.
        </Text>
      </Stack>
    </Container>
  );
}
