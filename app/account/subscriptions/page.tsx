"use client";

import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {useUser} from "@/providers/user-provider";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  canceled: "Cancelada",
  paused: "Pausada",
  incomplete: "Incompleta"
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300",
  canceled: "bg-red-500/20 text-red-300",
  paused: "bg-amber-500/20 text-amber-200",
  incomplete: "bg-yellow-500/20 text-yellow-200"
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {dateStyle: "long"});

export default function AccountSubscriptionsPage() {
  const {user, status} = useUser();

  const isLoading = status === "initializing" || (status === "loading" && !user);

  return (
    <Container maxW="4xl">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold md:text-4xl">Suscripciones</h1>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            <p className="text-white/70">Cargando tus suscripciones...</p>
          </div>
        ) : null}

        {!user && !isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
            <p className="text-sm text-white/70">Inicia sesión para consultar o gestionar tus suscripciones activas.</p>
          </div>
        ) : null}

        {user && !isLoading ? (
          <div className="flex flex-col gap-4">
            {user.subscriptions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
                <p className="text-sm text-white/70">Aún no tienes suscripciones activas.</p>
              </div>
            ) : (
              user.subscriptions.map((subscription) => {
                const statusKey = subscription.status.toLowerCase();
                const statusLabel = SUBSCRIPTION_STATUS_LABELS[statusKey] ?? subscription.status;
                const statusClass = SUBSCRIPTION_STATUS_COLORS[statusKey] ?? "bg-white/10 text-white/70";

                return (
                  <div key={subscription.id} className="rounded-2xl border border-white/10 bg-background/40 p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="font-semibold text-white">Plan: {subscription.plan}</p>
                        <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">
                        Activada el {dateFormatter.format(new Date(subscription.createdAt))}
                      </p>
                      <p className="text-sm text-white/70">Gestiona cambios o cancelaciones desde el portal de pagos.</p>
                      <Button className="mt-4 w-full sm:w-auto" disabled variant="outline">
                        Gestionar en Stripe Billing
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </Container>
  );
}
