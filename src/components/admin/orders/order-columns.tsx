"use client";

import Link from "next/link";
import {ColumnDef} from "@tanstack/react-table";
import type {OrderStatus} from "@prisma/client";

import {OrderStatusUpdater} from "@/components/admin/orders/OrderStatusUpdater";
import {Button} from "@/components/ui/button";
import {formatCurrency} from "@/utils/currency";

export type OrderItem = {
  id: string;
  name: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
  };
  items: OrderItem[];
};

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Orden",
    cell: ({row}) => {
      const id = row.original.id;
      const orderNumber = `#${id.slice(-8).toUpperCase()}`;

      return (
        <Link
          href={`/dashboard/orders/${id}`}
          className="font-semibold text-white hover:text-white/90 hover:underline"
        >
          {orderNumber}
        </Link>
      );
    },
  },
  {
    id: "customer",
    accessorFn: (order) => {
      const fullName = [order.user.name, order.user.lastName]
        .filter(Boolean)
        .join(" ");

      return fullName || order.user.email;
    },
    header: "Cliente",
    cell: ({row}) => {
      const {user} = row.original;
      const fullName = [user.name, user.lastName].filter(Boolean).join(" ");

      return (
        <div className="flex flex-col">
          <span className="font-medium text-white">{fullName || user.email}</span>
          <span className="text-xs text-white/60">{user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Monto total",
    cell: ({row}) => (
      <span className="font-semibold text-white">{formatCurrency(row.original.total)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({row}) => (
      <OrderStatusUpdater orderId={row.original.id} currentStatus={row.original.status} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({row}) => (
      <span className="text-sm text-white/70">
        {dateFormatter.format(new Date(row.original.createdAt))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({row}) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/dashboard/orders/${row.original.id}`}>
          Ver detalle
        </Link>
      </Button>
    ),
  },
];
