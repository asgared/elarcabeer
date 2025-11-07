'use server';

import {Prisma, OrderStatus} from "@prisma/client";
import {z} from "zod";

import {requireAdmin} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";

const orderStatusValues = Object.values(OrderStatus) as [OrderStatus, ...OrderStatus[]];

const updateOrderStatusSchema = z.object({
  orderId: z
    .string({required_error: "El identificador de la orden es obligatorio."})
    .trim()
    .min(1, "El identificador de la orden es obligatorio."),
  newStatus: z.enum(orderStatusValues),
});

type UpdateOrderStatusResult = {
  success: boolean;
  message: string;
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateOrderStatusResult> {
  await requireAdmin();

  const parsed = updateOrderStatusSchema.safeParse({orderId, newStatus});

  if (!parsed.success) {
    return {
      success: false,
      message: "Los datos proporcionados no son válidos.",
    };
  }

  try {
    await prisma.order.update({
      where: {id: parsed.data.orderId},
      data: {status: parsed.data.newStatus},
    });

    return {
      success: true,
      message: "Estado de la orden actualizado correctamente.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return {
        success: false,
        message: "La orden no existe.",
      };
    }

    console.error(`Error updating order ${orderId}:`, error);

    return {
      success: false,
      message: "No se pudo actualizar el estado de la orden.",
    };
  }
}
