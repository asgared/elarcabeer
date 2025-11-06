import {prisma} from "./prisma";

export type MonthlyRevenuePoint = {
  month: string;
  total: number;
};

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "2-digit"
});

export async function getMonthlyRevenue(): Promise<MonthlyRevenuePoint[]> {
  const results = await prisma.$queryRaw<{
    month: Date | string;
    total: number | string;
  }[]>`
    SELECT
      date_trunc('month', "createdAt") AS month,
      COALESCE(SUM("total"), 0) AS total
    FROM "Order"
    GROUP BY 1
    ORDER BY 1
  `;

  return results.map((entry) => {
    const monthDate = entry.month instanceof Date ? entry.month : new Date(entry.month);
    const formattedValue = monthFormatter.format(monthDate);
    const capitalized =
      formattedValue.length > 0
        ? formattedValue[0].toUpperCase() + formattedValue.slice(1)
        : formattedValue;

    return {
      month: capitalized,
      total: Number(entry.total) || 0
    };
  });
}
