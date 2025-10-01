import {Button, Heading, Icon, Stack, Table, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import Link from "next/link";
import {FaPlus, FaRegPenToSquare} from "react-icons/fa6";

import {getAllCmsContent} from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const entries = await getAllCmsContent();

  return (
    <Stack spacing={8}>
      <Stack direction={{base: "column", md: "row"}} justify="space-between" align={{base: "stretch", md: "center"}}>
        <Heading size="lg">Gestión de contenido</Heading>
        <Button as={Link} href="/admin/content/new" leftIcon={<FaPlus />} colorScheme="teal">
          Nueva sección
        </Button>
      </Stack>

      <Table variant="simple" bg="background.800" borderRadius="xl" overflow="hidden">
        <Thead>
          <Tr>
            <Th>Slug</Th>
            <Th>Título</Th>
            <Th>Actualizado</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => (
            <Tr key={entry.id}>
              <Td fontFamily="mono">{entry.slug}</Td>
              <Td>{entry.title}</Td>
              <Td>{new Date(entry.updatedAt).toLocaleString()}</Td>
              <Td textAlign="right">
                <Button
                  as={Link}
                  href={`/admin/content/${entry.slug}`}
                  size="sm"
                  leftIcon={<Icon as={FaRegPenToSquare} />}
                  variant="ghost"
                >
                  Editar
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
}
