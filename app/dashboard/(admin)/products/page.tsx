import Link from "next/link";
import { cookies, headers } from "next/headers";
import { PlusCircle } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { columns, type Product } from "@/components/admin/products/product-columns";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type ProductsResponse = {
  products: Product[];
};

function resolveBaseUrl() {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host");

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function getProducts(): Promise<Product[]> {
  const baseUrl = resolveBaseUrl();
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const headersInit: HeadersInit = {
    Accept: "application/json",
  };

  if (cookieHeader) {
    headersInit.Cookie = cookieHeader;
  }

  const response = await fetch(`${baseUrl}/api/dashboard/products`, {
    headers: headersInit,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.error === "string"
        ? errorBody.error
        : "No se pudieron cargar los productos.";

    throw new Error(message);
  }

  const data: ProductsResponse = await response.json();
  return data.products ?? [];
}

export default async function ProductsPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (err) {
    error = err instanceof Error ? err.message : "No se pudieron cargar los productos.";
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Productos"
        description="Administra el catálogo de productos disponibles en la tienda."
      >
        <Button asChild>
          <Link href="/dashboard/(admin)/products/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir producto
          </Link>
        </Button>
      </AdminPageHeader>

      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-6 text-sm text-danger">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          filterColumnId="name"
          filterPlaceholder="Filtrar por nombre o slug..."
        />
      )}
    </div>
  );
}
