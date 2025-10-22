"use client";

import { ReactNode, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaPowerOff } from "react-icons/fa6";
import type { User } from "@prisma/client";

type AdminShellProps = {
  user: User;
  children: ReactNode;
  sidebar: ReactNode; // <-- 1. AÑADIMOS EL NUEVO PROP
};

export function AdminShell({ user, children, sidebar }: AdminShellProps) { // <-- 2. RECIBIMOS EL PROP
  const router = useRouter();
  const toast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) {
        throw new Error("No se pudo cerrar sesión");
      }
      toast({ title: "Sesión finalizada", status: "success" });
      router.replace("/dashboard/login");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error instanceof Error ? error.message : "Intenta de nuevo",
        status: "error",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 3. AJUSTAMOS LA ESTRUCTURA PARA INCLUIR LA BARRA LATERAL
  return (
    <Flex minH="100vh" flex="1" direction="row" bg="background.900">
      {/* Aquí se renderiza la barra lateral que pasamos desde el layout */}
      {sidebar}

      {/* El contenido principal (header + children) va en su propio Flex */}
      <Flex flex="1" direction="column">
        <Flex
          as="header"
          borderBottomWidth="1px"
          borderColor="whiteAlpha.200"
          px={8}
          py={4}
          align="center"
          justify="space-between"
          bg="background.800"
        >
          <Heading size="md">El Arca · Admin</Heading>
          <HStack spacing={6} align="center">
            <Stack spacing={0} textAlign="right" fontSize="sm">
              <Text fontWeight="semibold">{user.name ?? user.email}</Text>
              <Text color="whiteAlpha.600">Administrador</Text>
            </Stack>
            <Button
              leftIcon={<FaPowerOff />}
              variant="outline"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              loadingText="Saliendo..."
            >
              Cerrar sesión
            </Button>
          </HStack>
        </Flex>

        {/* Esta es la sección principal donde se renderiza el contenido de la página */}
        <Box as="main" p={8} flex="1" overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}