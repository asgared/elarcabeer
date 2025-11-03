"use client";

import { Store } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Pencil, XCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const columns: ColumnDef<Store>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 px-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("name") as string}</span>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs uppercase tracking-wide text-white/70">
        {row.getValue("slug") as string}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => <span className="text-white/80">{row.getValue("address") as string}</span>,
  },
  {
    accessorKey: "petFriendly",
    header: "Pet Friendly",
    cell: ({ row }) => {
      const isPetFriendly = row.getValue("petFriendly") as boolean;

      return isPetFriendly ? (
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <CheckCircle className="h-4 w-4" /> Sí
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-400">
          <XCircle className="h-4 w-4" /> No
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span>Acciones</span>,
    cell: ({ row }) => {
      const slug = row.original.slug;

      return (
        <Button asChild size="sm" variant="ghost" className="text-white">
          <Link className="inline-flex items-center gap-2" href={`/dashboard/stores/${slug}`}>
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        </Button>
      );
    },
  },
];
