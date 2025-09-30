"use client";

import {Container, Spinner, Stack, Text} from "@chakra-ui/react";

import {AddressesManager} from "@/components/account/addresses-manager";
import {useUser} from "@/providers/user-provider";

export const dynamic = "force-dynamic";

export default function AddressesPage() {
  const {user, status} = useUser();

  const isLoading = status === "initializing" || (status === "loading" && !user);

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        {isLoading ? (
          <Stack align="center" py={12} spacing={4}>
            <Spinner size="xl" thickness="4px" />
            <Text color="whiteAlpha.700">Cargando direcciones...</Text>
          </Stack>
        ) : (
          <AddressesManager />
        )}
      </Stack>
    </Container>
  );
}
