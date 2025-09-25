import {Box, Button, Container, Heading, Stack, Text} from "@chakra-ui/react";

export default function AddressesPage() {
  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <Heading size="2xl">Direcciones guardadas</Heading>
        <Box borderRadius="2xl" borderWidth="1px" p={6}>
          <Text fontWeight="bold">Casa</Text>
          <Text color="whiteAlpha.700">Colima 200, Roma Norte, CDMX</Text>
          <Button mt={4} variant="outline">
            Editar dirección
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
