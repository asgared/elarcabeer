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

async function getOrder(orderId: string): Promise<OrderDetail> {
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
      typeof errorBody?.error === "string"
        ? errorBody.error
        : "No se pudo cargar la orden.";

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
    order = await getOrder(params.orderId);
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
  const paymentLabel = order.payment
    ? PAYMENT_STATUS_LABELS[paymentStatusKey] ?? order.payment.status
    : null;
  const paymentVariant = order.payment
    ? PAYMENT_STATUS_VARIANTS[paymentStatusKey] ?? "secondary"
    : "secondary";

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4">
        <AdminPageHeader
          title={`Orden ${orderNumber}`}
          description="Consulta el detalle completo de la orden, sus artículos y el estado de pago."
        >
          <Button asChild variant="outline">
            <Link href="/dashboard/(admin)/orders">Volver al listado</Link>
          </Button>
        </AdminPageHeader>

        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-background/50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm uppercase text-white/60">Estado actual</span>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              <span className="text-sm text-white/60">
                Creada el {dateFormatter.format(new Date(order.createdAt))}
              </span>
            </div>
            <OrderStatusForm orderId={order.id} initialStatus={order.status} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border-white/10 bg-background/60">
              <CardHeader>
                <CardTitle className="text-lg">Información del cliente</CardTitle>
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
                  <span className="text-white/60">Total de la orden</span>
                  <p className="font-semibold text-white">{formatCurrency(order.total)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-background/60">
              <CardHeader>
                <CardTitle className="text-lg">Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                {order.payment ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Monto pagado</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(order.payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Estado del pago</span>
                      <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                    </div>
                    <div>
                      <span className="text-white/60">Referencia</span>
                      <p className="font-mono text-sm text-white">
                        {order.payment.stripeSessionId}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-white/70">No se registró información de pago para esta orden.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-background/60">
              <CardHeader>
                <CardTitle className="text-lg">Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <p className="text-white/70">
                  No hay información de envío disponible para esta orden.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-white/10 bg-background/60">
          <CardHeader>
            <CardTitle className="text-lg">Artículos</CardTitle>
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
      </div>
    </div>
  );
}
