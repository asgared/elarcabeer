"use client";

import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

// Helper para formatear la fecha
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name ?? "N/A"}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const isAdmin = row.getValue("role") === "ADMIN";

      return isAdmin ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          ADMIN
        </div>
      ) : (
        <div className="flex items-center gap-2 text-white/80">
          <XCircle className="h-4 w-4" />
          USER
        </div>
      );
    },
  },
  // Nota: El modelo 'User' de Supabase Auth
  // no expone 'createdAt' directamente en el modelo de Prisma.
  // Si tuvieras un campo 'createdAt' en tu modelo User,
  // la siguiente columna funcionaría:
  // {
  //   accessorKey: "createdAt",
  //   header: "Registrado",
  //   cell: ({ row }) => formatDate(row.original.createdAt),
  // },
];
