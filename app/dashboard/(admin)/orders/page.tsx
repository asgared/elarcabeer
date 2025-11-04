import {cookies, headers} from "next/headers";

import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {DataTable} from "@/components/admin/data-table";
import {columns, type Order} from "@/components/admin/orders/order-columns";

export const dynamic = "force-dynamic";

type OrdersResponse = {
  orders: Order[];
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

async function getOrders(): Promise<Order[]> {
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

  const response = await fetch(`${baseUrl}/api/admin/orders?perPage=100`, {
    headers: headersInit,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.error === "string"
        ? errorBody.error
        : "No se pudieron cargar las órdenes.";

    throw new Error(message);
  }

  const data: OrdersResponse = await response.json();
  return data.orders ?? [];
}

export default async function OrdersPage() {
  let orders: Order[] = [];
  let error: string | null = null;

  try {
    orders = await getOrders();
  } catch (err) {
    error = err instanceof Error ? err.message : "No se pudieron cargar las órdenes.";
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        title="Órdenes"
        description="Consulta y administra las ventas realizadas en la tienda en línea."
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          filterColumnId="customer"
          filterPlaceholder="Filtrar por cliente o correo..."
        />
      )}
    </div>
  );
}
