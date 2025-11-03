import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";

import { columns } from "./columns";

export const dynamic = "force-dynamic";

async function getBlogPosts() {
  const data = await prisma.contentPost.findMany({
    orderBy: {
      published: "desc",
    },
  });

  return data;
}

export default async function BlogPostsPage() {
  const data = await getBlogPosts();

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Blog"
        description="Administra las entradas del blog, noticias y artículos."
      >
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nueva entrada
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
