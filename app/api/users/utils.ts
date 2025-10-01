import type {Prisma} from "@prisma/client";

import {prisma} from "@/lib/prisma";
import type {UserWithRelations} from "@/types/user";

export const userInclude = {
  addresses: true,
  orders: {
    include: {
      items: true,
      payments: true
    },
    orderBy: {createdAt: "desc"}
  },
  loyalty: {
    orderBy: {createdAt: "desc"}
  },
  subscriptions: {
    orderBy: {createdAt: "desc"}
  }
} as const;

export type UserWithSensitive = Prisma.UserGetPayload<{include: typeof userInclude}>;

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
    orders: user.orders.map((order) => ({
      id: order.id,
      number: order.number,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(({id, name, quantity, price}) => ({
        id,
        name,
        quantity,
        price
      })),
      payments: order.payments.map(({id, amount, method, status, processedAt}) => ({
        id,
        amount,
        method,
        status,
        processedAt: processedAt.toISOString()
      }))
    })),
    loyalty: user.loyalty.map(({id, points, reason, createdAt}) => ({
      id,
      points,
      reason,
      createdAt: createdAt.toISOString()
    })),
    subscriptions: user.subscriptions.map(({id, plan, status, createdAt}) => ({
      id,
      plan,
      status,
      createdAt: createdAt.toISOString()
    }))
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({where: {id: userId}, include: userInclude});
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({where: {email}, include: userInclude});
}
