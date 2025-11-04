import Link from "next/link";
import {cookies, headers} from "next/headers";
import {notFound} from "next/navigation";

import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {OrderStatusForm} from "@/components/admin/orders/order-status-form";
import {type Order} from "@/components/admin/orders/order-columns";
import {Badge, type BadgeProps} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {formatCurrency} from "@/utils/currency";

export const dynamic = "force-dynamic";

type OrderDetail = Order & {
  user: Order["user"] & {
    addresses?: Array<{
      id: string;
      label: string;
      street: string;
      city: string;
      country: string;
      postal: string;
    }>;
  };
  payment: {
    id: string;
    amount: number;
    status: string;
    stripeSessionId: string;
  } | null;
};

type OrderResponse = {
  order: OrderDetail;
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  SHIPPED: "Enviada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

const ORDER_STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Pagado",
  PENDING: "Pendiente",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

const PAYMENT_STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "destructive",
  REFUNDED: "info",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "long",
  timeStyle: "short",
});

function resolveBaseUrl() {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host");

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function getOrderDetails(orderId: string): Promise<OrderDetail> {
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

  const response = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
    headers: headersInit,
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.error === "string" ? errorBody.error : "No se pudo cargar la orden.";

    throw new Error(message);
  }

  const data: OrderResponse = await response.json();
  return data.order;
}

type OrderDetailPageProps = {
  params: {
    orderId: string;
  };
};

export default async function OrderDetailPage({params}: OrderDetailPageProps) {
  let order: OrderDetail | null = null;
  let error: string | null = null;

  try {
    order = await getOrderDetails(params.orderId);
  } catch (err) {
    error = err instanceof Error ? err.message : "No se pudo cargar la orden.";
  }

  if (error) {
    return (
      <div className="px-4 py-10 md:px-8">
        <AdminPageHeader title="Detalle de la orden" />
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
          {error}
        </div>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard/(admin)/orders">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const orderNumber = `#${order.id.slice(-8).toUpperCase()}`;
  const statusKey = order.status.toUpperCase();
  const statusLabel = ORDER_STATUS_LABELS[statusKey] ?? order.status;
  const statusVariant = ORDER_STATUS_VARIANTS[statusKey] ?? "secondary";

  const paymentStatusKey = order.payment?.status?.toUpperCase() ?? "";
  const paymentLabel = order.payment ? PAYMENT_STATUS_LABELS[paymentStatusKey] ?? order.payment.status : null;
  const paymentVariant = order.payment ? PAYMENT_STATUS_VARIANTS[paymentStatusKey] ?? "secondary" : "secondary";

  const primaryAddress = order.user.addresses?.[0];

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="flex flex-col gap-6">
        <AdminPageHeader
          title={`Orden ${orderNumber}`}
          description="Consulta el detalle completo de la orden, sus artículos y el estado de pago."
        >
          <Button asChild variant="outline">
            <Link href="/dashboard/(admin)/orders">Volver al listado</Link>
          </Button>
        </AdminPageHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-background/60">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Identificador</span>
                <span className="font-semibold text-white">{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Monto total</span>
                <span className="font-semibold text-white">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Fecha de creación</span>
                <span className="text-white">{dateFormatter.format(new Date(order.createdAt))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Estado de pago</span>
                {order.payment ? (
                  <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                ) : (
                  <span className="text-white/70">Sin información de pago</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-background/60">
            <CardHeader>
              <CardTitle className="text-lg">Detalles del cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/80">
              <div>
                <span className="text-white/60">Nombre</span>
                <p className="font-medium text-white">
                  {[order.user.name, order.user.lastName].filter(Boolean).join(" ") || order.user.email}
                </p>
              </div>
              <div>
                <span className="text-white/60">Correo electrónico</span>
                <p className="font-medium text-white">{order.user.email}</p>
              </div>
              <div>
                <span className="text-white/60">Dirección</span>
                {primaryAddress ? (
                  <p className="font-medium text-white">
                    {primaryAddress.street}, {primaryAddress.city}, {primaryAddress.country} {primaryAddress.postal}
                  </p>
                ) : (
                  <p className="text-white/70">Sin dirección registrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-background/60">
          <CardHeader>
            <CardTitle className="text-lg">Ítems de la orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <Table>
                <TableHeader className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
                  <TableRow>
                    <TableHead className="px-6 py-3">Producto</TableHead>
                    <TableHead className="px-6 py-3">Cantidad</TableHead>
                    <TableHead className="px-6 py-3">Precio unitario</TableHead>
                    <TableHead className="px-6 py-3">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id} className="border-white/5">
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{item.name}</span>
                          <span className="text-xs text-white/50">SKU: {item.variantId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-white/80">x{item.quantity}</TableCell>
                      <TableCell className="px-6 py-4 text-white/80">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-background/60">
          <CardHeader>
            <CardTitle className="text-lg">Gestión de estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/60">Estado actual:</span>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
            <OrderStatusForm orderId={order.id} initialStatus={order.status} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
