"use client";

import { CmsContent } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

type CmsContentRow = Omit<CmsContent, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<CmsContentRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-3 px-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Título
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <span className="font-medium text-white">{row.getValue("title")}</span>,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs uppercase tracking-wide text-white/70">
        {row.getValue("slug")}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Última actualización",
    cell: ({ row }) => (
      <span className="text-white/70">{formatDate(row.getValue("updatedAt"))}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span>Acciones</span>,
    cell: ({ row }) => {
      const slug = row.original.slug;

      return (
        <Button asChild size="sm" variant="ghost" className="text-white">
          <Link className="inline-flex items-center gap-2" href={`/dashboard/content/${slug}`}>
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        </Button>
      );
    },
  },
];

export type { CmsContentRow };
