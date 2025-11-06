"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProductType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/currency";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: ProductType;
  style: string | null;
  rating: number | null;
  limitedEdition: boolean;
  categoryLabel: string | null;
  metadata: unknown;
  images: unknown;
  price: number;
  stock: number;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  BEER: "Cerveza",
  FOOD: "Alimento",
};

function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/dashboard/products/${product.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const message =
            typeof data?.error === "string"
              ? data.error
              : "No se pudo eliminar el producto.";
          throw new Error(message);
        }

        toast({ title: "Producto eliminado", status: "success" });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error al eliminar",
          description:
            error instanceof Error ? error.message : "No se pudo eliminar el producto.",
          status: "error",
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/dashboard/products/${product.id}`}>Editar</Link>
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-danger/50 text-danger hover:bg-danger/10"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "Eliminando..." : "Eliminar"}
      </Button>
    </div>
  );
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="font-semibold text-white">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="text-sm text-white/70">{row.original.slug}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <span className="text-sm text-white/70">
        {PRODUCT_TYPE_LABELS[row.original.type] ?? row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => (
      <span className="font-semibold text-white">{formatCurrency(row.original.price)}</span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="text-sm text-white/70">{row.original.stock}</span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ProductActions product={row.original} />,
  },
];
