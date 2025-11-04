import { prisma } from "@/lib/prisma";

export type DashboardMetrics = {
  totalProducts: number;
  totalBlogPosts: number;
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    totalProducts,
    totalBlogPosts,
    totalClients,
    totalOrders,
    totalRevenueResult,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.contentPost.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.total ?? 0;

  return {
    totalProducts,
    totalBlogPosts,
    totalClients,
    totalOrders,
    totalRevenue,
  };
}
