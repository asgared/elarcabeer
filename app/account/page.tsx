"use client";

import NextLink from "next/link";

import {AccountAccessPanel} from "@/components/account/account-access";
import {ProfileForm} from "@/components/account/profile-form";
import {Container} from "@/components/ui/container";
import {useUser} from "@/providers/user-provider";
import {formatCurrency} from "@/utils/currency";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  const {user, status} = useUser();

  const isLoading = status === "initializing" || (status === "loading" && !user);

  const completedStatuses = new Set(["fulfilled", "delivered", "completed"]);
  const totalOrders = user?.orders?.length ?? 0;
  const totalSpent =
    user?.orders?.reduce((sum, order) => {
      if (completedStatuses.has(order.status.toLowerCase())) {
        return sum + order.total;
      }

      return sum;
    }, 0) ?? 0;
  const loyaltyPoints = user?.loyalty?.reduce((sum, entry) => sum + entry.points, 0) ?? 0;
  const activeSubscriptions =
    user?.subscriptions?.filter((subscription) => subscription.status === "active")?.length ?? 0;

  return (
    <Container maxW="5xl">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold md:text-4xl">Tu cuenta</h1>
          {user ? (
            <p className="text-white/70">
              Bienvenida, {user.name ?? user.email}. Gestiona tu perfil y tus pedidos recientes.
            </p>
          ) : (
            <p className="text-white/70">
              Crea una cuenta o inicia sesión para seguir tus compras, pagos y direcciones favoritas.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            <p className="text-white/70">Cargando tu información...</p>
          </div>
        ) : null}

        {!user && !isLoading ? <AccountAccessPanel /> : null}

        {user && !isLoading ? (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <p className="text-xs uppercase tracking-wide text-white/60">Órdenes totales</p>
                <p className="mt-2 text-2xl font-semibold">{totalOrders}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <p className="text-xs uppercase tracking-wide text-white/60">Gasto acumulado</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <p className="text-xs uppercase tracking-wide text-white/60">Puntos de lealtad</p>
                <p className="mt-2 text-2xl font-semibold">{loyaltyPoints}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <p className="text-xs uppercase tracking-wide text-white/60">Suscripciones activas</p>
                <p className="mt-2 text-2xl font-semibold">{activeSubscriptions}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <h2 className="text-lg font-semibold">
                  <NextLink href="/account/orders">Órdenes y pagos</NextLink>
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Revisa el detalle de tus compras, pagos y entregas.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <h2 className="text-lg font-semibold">
                  <NextLink href="/account/subscriptions">Suscripciones</NextLink>
                </h2>
                <p className="mt-2 text-sm text-white/70">Gestiona tus membresías del Beer Club.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <h2 className="text-lg font-semibold">
                  <NextLink href="/account/addresses">Direcciones</NextLink>
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Mantén al día tus direcciones de entrega favoritas.
                </p>
              </div>
            </div>

            <ProfileForm />
          </div>
        ) : null}
      </div>
    </Container>
  );
}
