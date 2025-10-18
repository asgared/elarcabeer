"use client";

import {ReactNode, useState} from "react";

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
import {useRouter} from "next/navigation";
import {FaPowerOff} from "react-icons/fa6";

import type {User} from "@prisma/client";

type AdminShellProps = {
  user: User;
  children: ReactNode;
};

export function AdminShell({user, children}: AdminShellProps) {
  const router = useRouter();
  const toast = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/admin/session", {method: "DELETE"});

      if (!response.ok) {
        throw new Error("No se pudo cerrar sesión");
      }

      toast({title: "Sesión finalizada", status: "success"});
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

  return (
    <Flex minH="100vh" flex="1" direction="column" bg="background.900">
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
          >
            Salir
          </Button>
        </HStack>
      </Flex>

      <Box as="main" flex="1" px={{base: 4, md: 10}} py={10} maxW="6xl" w="100%" mx="auto">
        {children}
      </Box>
    </Flex>
  );
}
