"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import type {MonthlyRevenuePoint} from "@/lib/dashboard-charts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type RevenueChartProps = {
  data: MonthlyRevenuePoint[];
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

export function RevenueChart({data}: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Ingresos Mensuales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="currentColor" tickLine={false} axisLine={false} />
              <YAxis
                stroke="currentColor"
                tickFormatter={(value) => currencyFormatter.format(value)}
                width={100}
              />
              <Tooltip
                cursor={{fill: "hsl(var(--muted))"}}
                contentStyle={{backgroundColor: "hsl(var(--background))", borderRadius: "0.5rem"}}
                formatter={(value: number) => currencyFormatter.format(value)}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
