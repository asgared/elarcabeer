import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { UserWithRelations } from "@/types/user";

// 1. CONSULTA CORREGIDA Y SIMPLIFICADA
export const userInclude = {
  addresses: true,
  orders: {
    orderBy: {createdAt: "desc"},
    include: {
      items: true,
      payment: true, // Corregido a 'payment' (singular) y sin 'orderBy'
    },
  },
  loyalty: true,
  subscriptions: true,
} as const;

export type UserWithSensitive = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

// 2. TRANSFORMADOR DE DATOS CORREGIDO
export function serializeUser(user: UserWithSensitive): UserWithRelations {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    addresses: user.addresses.map(({id, label, street, city, country, postal}) => ({
      id,
      label,
      street,
      city,
      country,
      postal
    })),
    orders: user.orders.map((order) => {
      const orderNumber = "number" in order ? (order as {number?: string | null}).number ?? null : null;

      return {
        id: order.id,
        number: orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map(({id, name, quantity, price, productId, variantId}) => ({
          id,
          name,
          quantity,
          price,
          productId,
          variantId
        })),
        payment: order.payment
          ? {
              id: order.payment.id,
              amount: order.payment.amount,
              status: order.payment.status,
              stripeSessionId: order.payment.stripeSessionId
            }
          : null
      };
    }),
    loyalty: user.loyalty.map(({id, points, reason, createdAt}) => ({
      id,
      points,
      reason,
      createdAt: createdAt.toISOString(),
    })),
    subscriptions: user.subscriptions.map(({ id, plan, status, createdAt }) => ({
      id,
      plan,
      status,
      createdAt: createdAt.toISOString(),
    })),
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, include: userInclude });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: userInclude });
}

