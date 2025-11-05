import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import type { Product } from "@/components/admin/products/product-columns";

export const dynamic = "force-dynamic";

type ProductResponse = {
  product: Product;
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

async function fetchProduct(id: string): Promise<Product | null> {
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

  const response = await fetch(`${baseUrl}/api/dashboard/products/${id}`, {
    headers: headersInit,
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.error === "string"
        ? errorBody.error
        : "No se pudo obtener el producto.";

    throw new Error(message);
  }

  const data: ProductResponse = await response.json();
  return data.product;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const isNew = id === "new";

  let product: Product | null = null;

  if (!isNew) {
    product = await fetchProduct(id);

    if (!product) {
      notFound();
    }
  }

  const title = isNew ? "Crear producto" : `Editar ${product?.name ?? "producto"}`;
  const description = isNew
    ? "Completa el formulario para añadir un nuevo producto al catálogo."
    : "Actualiza la información del producto seleccionado.";

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader title={title} description={description} />
      <ProductForm initialProduct={product} />
    </div>
  );
}
