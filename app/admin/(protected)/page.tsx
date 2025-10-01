import {Heading, SimpleGrid, Stack, Stat, StatHelpText, StatLabel, StatNumber, Text} from "@chakra-ui/react";

import {getAllCmsContent} from "@/lib/cms";
import {prisma} from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [contentEntries, productCount, userCount] = await Promise.all([
    getAllCmsContent(),
    prisma.product.count(),
    prisma.user.count()
  ]);

  return (
    <Stack spacing={10}>
      <Stack spacing={3}>
        <Heading size="lg">Resumen general</Heading>
        <Text color="whiteAlpha.700">Consulta el estado del catálogo, usuarios y los bloques de contenido administrables.</Text>
      </Stack>

      <SimpleGrid columns={{base: 1, md: 3}} spacing={6}>
        <Stat borderWidth="1px" borderRadius="xl" p={6} bg="background.800">
          <StatLabel>Entradas CMS</StatLabel>
          <StatNumber>{contentEntries.length}</StatNumber>
          <StatHelpText>Secciones editables</StatHelpText>
        </Stat>
        <Stat borderWidth="1px" borderRadius="xl" p={6} bg="background.800">
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
}
