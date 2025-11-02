import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";

import { columns, CmsContentRow } from "./columns";
import { DataTable } from "./data-table";

export const dynamic = "force-dynamic";

async function getCmsContentData(): Promise<CmsContentRow[]> {
  const data = await prisma.cmsContent.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return data.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export default async function CmsContentPage() {
  const data = await getCmsContentData();

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Contenido (CMS)"
        description="Administra las secciones de contenido estático de tu sitio web (ej. 'Quiénes Somos')."
      >
        <Button asChild>
          <Link href="/dashboard/content/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva sección
          </Link>
        </Button>
      </AdminPageHeader>

      <DataTable
        columns={columns}
        data={data}
        filterColumnId="title"
        filterPlaceholder="Filtrar por título..."
      />
    </div>
  );
}
