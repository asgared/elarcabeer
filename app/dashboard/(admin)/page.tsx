import Link from "next/link";
import { DollarSign, NotebookText, Package, ShoppingCart, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { getDashboardMetrics } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  const formattedRevenue = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(metrics.totalRevenue);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Consulta el estado general del negocio y accede rápidamente a cada sección."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Link href="/dashboard/products" className="block">
          <MetricCard
            title="Total Productos"
            value={metrics.totalProducts.toString()}
            description="Haz click para gestionar inventario"
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
        </Link>

        <Link href="/dashboard/blog" className="block">
          <MetricCard
            title="Notas de Blog"
            value={metrics.totalPosts.toString()}
            description="Administra las entradas del blog"
            icon={<NotebookText className="h-4 w-4 text-muted-foreground" />}
          />
        </Link>

        <Link href="/dashboard/clients" className="block">
          <MetricCard
            title="Clientes Registrados"
            value={metrics.totalClients.toString()}
            description="Gestiona tu base de clientes"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
        </Link>

        <Link href="/dashboard/orders" className="block">
          <MetricCard
            title="Ventas Totales"
            value={metrics.totalOrders.toString()}
            description="Revisa y gestiona tus órdenes"
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          />
        </Link>

        <Link href="/dashboard/orders" className="block">
          <MetricCard
            title="Ingresos Totales"
            value={formattedRevenue}
            description="Consulta el rendimiento financiero"
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
        </Link>
      </div>
    </>
  );
}
