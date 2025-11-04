import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "./columns";

export const dynamic = "force-dynamic";

async function getUsers() {
  const data = await prisma.user.findMany({
    orderBy: {
      email: "asc",
    },
  });

  return data;
}

export default async function UsersPage() {
  const data = await getUsers();

  return (
    <>
      <AdminPageHeader
        title="Clientes"
        description="Lista de todos los usuarios registrados en la plataforma."
      />

      {/* Esta página es de solo lectura, por eso no hay botón de "Añadir nuevo" */}

      <DataTable
        columns={columns}
        data={data}
        filterColumnId="email"
        filterPlaceholder="Filtrar por email..."
      />
    </>
  );
}
