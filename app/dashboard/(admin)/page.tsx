import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/admin/metric-card";
import { prisma } from "@/lib/prisma"; // <-- Importamos Prisma
export const dynamic = "force-dynamic";

/**
 * Obtiene las métricas reales del dashboard desde la base de datos.
 */
async function getDashboardMetrics() {
  // Usamos 'Promise.all' para ejecutar todas las consultas en paralelo
  try {
    const [cmsCount, productCount, userCount] = await Promise.all([
      prisma.cmsContent.count(),
      prisma.product.count(), // Contamos productos (no variantes)
      prisma.user.count({
        where: { role: "USER" },
      }), // Solo clientes, no admins
    ]);

    return {
      cmsCount,
      productCount,
      userCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // En caso de error, devolvemos 0 para no crashear la UI
    return {
      cmsCount: 0,
      productCount: 0,
      userCount: 0,
    };
  }
}

/**
 * La página principal del panel de administración.
 */
export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Consulta el estado del catálogo, usuarios y CMS."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          label="Secciones CMS"
          value={metrics.cmsCount}
          description="Secciones de contenido editables"
        />
        <MetricCard
          label="Productos"
          value={metrics.productCount}
          description="Productos activos en catálogo"
        />
        <MetricCard
          label="Clientes"
          value={metrics.userCount}
          description="Clientes registrados"
        />
      </div>
    </>
  );
}
