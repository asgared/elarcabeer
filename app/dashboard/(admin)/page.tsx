import {Heading, SimpleGrid, Stack, Stat, StatHelpText, StatLabel, StatNumber, Text} from "@chakra-ui/react";
import Link from "next/link";

import {getAllCmsContent} from "@/lib/cms";
import {prisma} from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  try {
    const [contentEntries, productCount, userCount] = await Promise.all([
      getAllCmsContent(),
      prisma.product.count(),
      prisma.user.count()
    ]);

    return (
      <Stack spacing={10}>
        <Stack spacing={3}>
          <Heading size="lg">Resumen general</Heading>
          <Text color="whiteAlpha.700">
            Consulta el estado del catálogo, usuarios y los bloques de contenido administrables.
          </Text>
        </Stack>

        <SimpleGrid columns={{base: 1, md: 3}} spacing={6}>
          <Stat borderWidth="1px" borderRadius="xl" p={6} bg="background.800">
            <StatLabel>Entradas CMS</StatLabel>
            <StatNumber>{contentEntries.length}</StatNumber>
            <StatHelpText>Secciones editables</StatHelpText>
          </Stat>
          <Stat
            as={Link}
            href="/dashboard/products"
            borderWidth="1px"
            borderRadius="xl"
            p={6}
            bg="background.800"
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            _hover={{
              textDecoration: "none",
              boxShadow: "lg",
              transform: "translateY(-4px)",
              bg: "background.700",
            }}
          >
            <StatLabel>Productos</StatLabel>
            <StatNumber>{productCount}</StatNumber>
            <StatHelpText>Activos en catálogo</StatHelpText>
          </Stat>
          <Stat borderWidth="1px" borderRadius="xl" p={6} bg="background.800">
            <StatLabel>Usuarios</StatLabel>
            <StatNumber>{userCount}</StatNumber>
            <StatHelpText>Clientes registrados</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Stack>
    );
  } catch (error) {
    console.error("Error loading admin dashboard metrics", error);

    return (
      <Stack spacing={6}>
        <Heading size="lg">Resumen general</Heading>
        <Text color="whiteAlpha.700">
          No pudimos cargar las métricas del dashboard en este momento. Intenta nuevamente más tarde.
        </Text>
      </Stack>
    );
  }
}
