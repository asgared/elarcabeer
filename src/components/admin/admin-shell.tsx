"use client";

import {ReactNode, useState} from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Stack,
  Text,
  useToast
} from "@chakra-ui/react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {FaBook, FaGears, FaPowerOff} from "react-icons/fa6";

import type {User} from "@prisma/client";

type AdminShellProps = {
  user: User;
  children: ReactNode;
};

const NAV_LINKS = [
  {label: "Panel", href: "/dashboard", icon: FaGears},
  {label: "Contenido", href: "/dashboard/content", icon: FaBook}
];

export function AdminShell({user, children}: AdminShellProps) {
  const pathname = usePathname();
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
        status: "error"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Flex minH="100vh" direction="column" bg="background.900">
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
          <Button leftIcon={<FaPowerOff />} variant="outline" size="sm" onClick={handleLogout} isLoading={isLoggingOut}>
            Salir
          </Button>
        </HStack>
      </Flex>

      <Flex flex="1">
        <Box
          as="nav"
          w={{base: "100%", md: 64}}
          borderRightWidth="1px"
          borderColor="whiteAlpha.200"
          bg="background.800"
          display={{base: "none", md: "block"}}
        >
          <Stack py={6} spacing={1}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <ChakraLink
                  key={link.href}
                  as={Link}
                  href={link.href}
                  px={6}
                  py={3}
                  display="flex"
                  alignItems="center"
                  gap={3}
                  fontWeight={isActive ? "bold" : "medium"}
                  bg={isActive ? "teal.500" : "transparent"}
                  color={isActive ? "black" : undefined}
                  _hover={{textDecoration: "none", bg: isActive ? "teal.400" : "whiteAlpha.100"}}
                >
                  <Icon as={link.icon} />
                  {link.label}
                </ChakraLink>
              );
            })}
          </Stack>
        </Box>
        <Box as="main" flex="1" px={{base: 4, md: 10}} py={10} maxW="6xl">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
