import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";

import { columns } from "./columns";

export const dynamic = "force-dynamic";

async function getStores() {
  const data = await prisma.store.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return data;
}

export default async function StoresPage() {
  const data = await getStores();

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Tiendas y Sucursales"
        description="Administra las ubicaciones físicas de El Arca Beer."
      >
        <Button asChild>
          <Link href="/dashboard/stores/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva tienda
          </Link>
        </Button>
      </AdminPageHeader>

      <DataTable
        columns={columns}
        data={data}
        filterColumnId="name"
        filterPlaceholder="Filtrar por nombre..."
      />
    </div>
  );
}
