import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { UserWithRelations } from "@/types/user";

// 1. CONSULTA CORREGIDA Y SIMPLIFICADA
export const userInclude = {
  addresses: true,
  orders: {
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
    addresses: user.addresses,
    orders: user.orders.map((order) => ({
      id: order.id,
      number: order.id.slice(-6).toUpperCase(), // Generamos un número de orden a partir del ID
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items,
      payments: order.payment // Comprobamos si el pago (singular) existe
        ? [ // Si existe, lo envolvemos en un array para mantener la estructura
            {
              id: order.payment.id,
              amount: order.payment.amount,
              status: order.payment.status,
            },
          ]
        : [], // Si no existe, devolvemos un array vacío
    })),
    loyalty: user.loyalty.map(({ id, points, reason, createdAt }) => ({
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

