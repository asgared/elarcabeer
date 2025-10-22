"use client";

import {Button, Heading, Stack, Text} from "@chakra-ui/react";
import NextLink from "next/link";
import {useSearchParams} from "next/navigation";

import {Container} from "@/components/ui/container";

export default function AccountCheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Container maxW="2xl" py={{base: 16, md: 24}} centerContent>
      <Stack spacing={6} textAlign="center" align="center">
        <Heading size="lg">Revisa tu correo electrónico</Heading>
        <Text color="whiteAlpha.700">
          {email
            ? `Hemos enviado un enlace de confirmación a ${email}. Sigue las instrucciones que encontrarás en tu bandeja de entrada.`
            : "Hemos enviado un enlace de confirmación a tu correo. Sigue las instrucciones que encontrarás en tu bandeja de entrada."}
        </Text>
        <Text color="whiteAlpha.700">
          Si no ves el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo envío desde la página de acceso.
        </Text>
        <Button as={NextLink} href="/account" colorScheme="yellow">
          Volver a iniciar sesión
        </Button>
      </Stack>
    </Container>
  );
}
