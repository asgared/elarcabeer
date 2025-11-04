import { prisma } from "@/lib/prisma";

export type DashboardMetrics = {
  totalProducts: number;
  totalPosts: number;
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [totalProducts, totalPosts, totalClients, totalOrders, revenueAggregate] =
    await Promise.all([
      prisma.product.count(),
      prisma.post.count(),
      prisma.client.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

  const revenueValue = revenueAggregate._sum.totalAmount ?? 0;
  const totalRevenue =
    typeof revenueValue === "number"
      ? revenueValue
      : typeof revenueValue === "bigint"
      ? Number(revenueValue)
      : typeof revenueValue === "object" && revenueValue !== null && "toNumber" in revenueValue
      ? Number((revenueValue as { toNumber: () => number }).toNumber())
      : Number(revenueValue);

  return {
    totalProducts,
    totalPosts,
    totalClients,
    totalOrders,
    totalRevenue,
  };
}
