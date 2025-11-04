import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {z} from "zod";

import {getAdminSession} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ORDER_STATUS_VALUES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const orderStatusSchema = z
  .object({
    status: z
      .string({required_error: "El estado es obligatorio."})
      .trim()
      .min(1, "El estado es obligatorio.")
      .transform((value) => value.toUpperCase())
      .refine((value) => ORDER_STATUS_VALUES.includes(value as (typeof ORDER_STATUS_VALUES)[number]), {
        message: "Estado de orden no válido.",
      }),
  })
  .transform((data) => ({status: data.status as (typeof ORDER_STATUS_VALUES)[number]}));

type RouteContext = {
  params: {
    orderId: string;
  };
};

export async function GET(_request: Request, {params}: RouteContext) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({error: "No autorizado."}, {status: 401});
    }

    const order = await prisma.order.findUnique({
      where: {id: params.orderId},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({error: "Orden no encontrada."}, {status: 404});
    }

    return NextResponse.json({order});
  } catch (error) {
    console.error(`Error fetching admin order ${params.orderId}:`, error);
    return NextResponse.json({error: "No se pudo obtener la orden."}, {status: 500});
  }
}

export async function PATCH(request: Request, {params}: RouteContext) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({error: "No autorizado."}, {status: 401});
    }

    const json = await request.json();
    const payload = orderStatusSchema.parse(json);

    const order = await prisma.order.update({
      where: {id: params.orderId},
      data: {status: payload.status},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        items: true,
        payment: true,
      },
    });

    return NextResponse.json({order});
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({error: "Orden no encontrada."}, {status: 404});
    }

    console.error(`Error updating admin order ${params.orderId}:`, error);
    return NextResponse.json({error: "No se pudo actualizar la orden."}, {status: 500});
  }
}
