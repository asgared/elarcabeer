"use client";

import NextLink from "next/link";
import {useEffect, useRef} from "react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {useUser} from "@/providers/user-provider";
import {formatCurrency} from "@/utils/currency";

export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<string, string> = {
  fulfilled: "Completado",
  delivered: "Entregado",
  processing: "Procesando",
  pending: "Pendiente",
  cancelled: "Cancelado",
};

const ORDER_STATUS_CLASSES: Record<string, string> = {
  fulfilled: "bg-emerald-500/20 text-emerald-300",
  delivered: "bg-emerald-500/20 text-emerald-300",
  processing: "bg-yellow-500/20 text-yellow-200",
  pending: "bg-amber-500/20 text-amber-200",
  cancelled: "bg-red-500/20 text-red-300",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  failed: "Fallido",
  refunded: "Reembolsado",
};

const PAYMENT_STATUS_CLASSES: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-300",
  pending: "bg-amber-500/20 text-amber-200",
  failed: "bg-red-500/20 text-red-300",
  refunded: "bg-purple-500/20 text-purple-200",
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {dateStyle: "long", timeStyle: "short"});

export default function OrdersPage() {
  const {user, status, refreshUser} = useUser();
  const lastRefreshedUserId = useRef<string | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId || lastRefreshedUserId.current === userId) {
      return;
    }

    lastRefreshedUserId.current = userId;
    void refreshUser();
  }, [refreshUser, userId]);

  const isLoading = status === "initializing" || (status === "loading" && !user);

  if (isLoading) {
    return (
      <Container className="max-w-4xl">
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
          <p className="text-white/70">Cargando historial de órdenes...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold md:text-4xl">Órdenes</h1>
          <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
            <p className="text-sm text-white/70">
              Inicia sesión o crea una cuenta para consultar el detalle de tus compras y pagos.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  const orders = user.orders;

  return (
    <Container className="max-w-4xl">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold md:text-4xl">Órdenes</h1>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
            <p className="text-sm text-white/70">Aún no has realizado compras. Tu historial aparecerá aquí.</p>
          </div>
        ) : (
          <Accordion defaultValue={[orders[0]?.id ?? ""]} type="multiple">
            {orders.map((order) => {
              const orderNumber = order.number ?? `#${order.id.slice(-8).toUpperCase()}`;
              const statusKey = order.status.toLowerCase();
              const statusLabel = ORDER_STATUS_LABELS[statusKey] ?? order.status;
              const statusClass = ORDER_STATUS_CLASSES[statusKey] ?? "bg-white/10 text-white/70";

              return (
                <AccordionItem key={order.id} value={order.id} className="border-b border-white/10">
                  <AccordionTrigger className="px-0 text-left">
                    <div className="flex flex-1 flex-col gap-1 text-left">
                      <span className="font-semibold text-white">{orderNumber}</span>
                      <span className="text-sm text-white/70">{dateFormatter.format(new Date(order.createdAt))}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-6 pt-2">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Artículos</h2>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-6 text-white/70">
                              <span>x{item.quantity}</span>
                              <span className="font-medium text-white">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="h-px bg-white/10" />

                      <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Pago</h2>
                        {!order.payment ? (
                          <p className="text-sm text-white/70">Pago pendiente por procesar.</p>
                        ) : (
                          (() => {
                            const paymentKey = order.payment.status.toLowerCase();
                            const paymentLabel = PAYMENT_STATUS_LABELS[paymentKey] ?? order.payment.status;
                            const paymentClass = PAYMENT_STATUS_CLASSES[paymentKey] ?? "bg-white/10 text-white/70";

                            return (
                              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-background/40 p-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">{formatCurrency(order.payment.amount)}</span>
                                  <span className="text-sm text-white/70">
                                    Referencia: {order.payment.stripeSessionId.slice(0, 8)}…
                                  </span>
                                </div>
                                <span
                                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${paymentClass}`}
                                >
                                  {paymentLabel}
                                </span>
                              </div>
                            );
                          })()
                        )}
                      </div>

                      <Button asChild className="w-full sm:w-auto" variant="outline">
                        <NextLink href={`/account/orders/${order.id}`}>Ver detalle</NextLink>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </Container>
  );
}
