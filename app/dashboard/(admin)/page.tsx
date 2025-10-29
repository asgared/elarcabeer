import Link from "next/link";

import {getAllCmsContent} from "@/lib/cms";
import {prisma} from "@/lib/prisma";
import {cn} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  try {
    const [contentEntries, productCount, userCount] = await Promise.all([
      getAllCmsContent(),
      prisma.product.count(),
      prisma.user.count()
    ]);

    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Resumen general</h1>
          <p className="text-base text-white/70">
            Consulta el estado del catálogo, usuarios y los bloques de contenido administrables.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-muted p-6 shadow-soft">
            <p className="text-sm font-medium text-white/80">Entradas CMS</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">{contentEntries.length}</p>
            <p className="mt-1 text-sm text-white/60">Secciones editables</p>
          </div>
          <Link
            href="/dashboard/products"
            className={cn(
              "rounded-xl border border-white/10 bg-muted p-6 shadow-soft transition-all duration-200",
              "hover:-translate-y-1 hover:bg-muted/90 hover:shadow-card focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            <p className="text-sm font-medium text-white/80">Productos</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">{productCount}</p>
            <p className="mt-1 text-sm text-white/60">Activos en catálogo</p>
          </Link>
          <div className="rounded-xl border border-white/10 bg-muted p-6 shadow-soft">
            <p className="text-sm font-medium text-white/80">Usuarios</p>
            <p className="mt-2 text-4xl font-semibold text-foreground">{userCount}</p>
            <p className="mt-1 text-sm text-white/60">Clientes registrados</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading admin dashboard metrics", error);

    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Resumen general</h1>
        <p className="text-base text-white/70">
          No pudimos cargar las métricas del dashboard en este momento. Intenta nuevamente más tarde.
        </p>
      </div>
    );
  }
}
