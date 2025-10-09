import {Container} from "@/components/ui/container";
import {Heading, Stack, Text} from "@chakra-ui/react";

export default function TermsPage() {
  return (
    <Container maxW="4xl">
      <Stack spacing={4}>
        <Heading size="2xl">Términos y condiciones</Heading>
        <Text color="whiteAlpha.700">
          Todas las compras se procesan en MXN. Los precios incluyen IVA. El consumo de alcohol es para mayores de 18 años.
          Consulta políticas de cancelación y devoluciones antes de confirmar tu pedido.
        </Text>
      </Stack>
    </Container>
  );
}
