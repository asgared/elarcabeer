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
          borderColor="whiteAlpha.100"
          px={8}
          py={4}
          align="center"
          justify="space-between"
          bg="rgba(10, 10, 10, 0.8)"
          backdropFilter="blur(10px)"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <HStack spacing={4}>
            <Text color="whiteAlpha.400" fontSize="sm" fontWeight="medium">Panel de Control</Text>
            <Text color="whiteAlpha.300">/</Text>
            <Heading size="sm" fontWeight="bold" letterSpacing="tight">Administración</Heading>
          </HStack>

          <HStack spacing={6} align="center">
            <Stack spacing={0} textAlign="right" display={{ base: "none", md: "flex" }}>
              <Text fontSize="sm" fontWeight="bold">{user.name ?? user.email}</Text>
              <Text fontSize="xs" color="amber.500" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                Administrador
              </Text>
            </Stack>
            <Button
              leftIcon={<FaPowerOff />}
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              color="whiteAlpha.600"
              _hover={{ color: "red.400", bg: "whiteAlpha.50" }}
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