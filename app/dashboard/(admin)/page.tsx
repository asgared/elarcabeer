import {getAllCmsContent} from "@/lib/cms";
import {prisma} from "@/lib/prisma";
import {MetricCard} from "@/components/dashboard/metric-card";

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
          <MetricCard
            label="Entradas CMS"
            value={contentEntries.length}
            description="Secciones editables"
          />
          <MetricCard
            href="/dashboard/products"
            label="Productos"
            value={productCount}
            description="Activos en catálogo"
          />
          <MetricCard
            label="Usuarios"
            value={userCount}
            description="Clientes registrados"
          />
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
