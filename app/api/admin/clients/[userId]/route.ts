import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {ZodError, z} from "zod";

import {getAdminSession} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";

const clientUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio.")
      .max(191, "El nombre es demasiado largo.")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(1, "El apellido es obligatorio.")
      .max(191, "El apellido es demasiado largo.")
      .optional(),
    role: z.enum(["ADMIN", "USER"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes proporcionar al menos un campo para actualizar.",
    path: ["root"],
  });

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    userId: string;
  };
};

export async function PATCH(request: Request, {params}: RouteContext) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({error: "No autorizado."}, {status: 401});
    }

    const json = await request.json();
    const payload = clientUpdateSchema.parse(json);

    const user = await prisma.user.update({
      where: {id: params.userId},
      data: payload,
    });

    return NextResponse.json({user}, {status: 200});
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({error: "Cliente no encontrado."}, {status: 404});
    }

    console.error(`Error actualizando al cliente ${params.userId}:`, error);

    return NextResponse.json({error: "No se pudo actualizar al cliente."}, {status: 500});
  }
}

export async function DELETE(_request: Request, {params}: RouteContext) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({error: "No autorizado."}, {status: 401});
    }

    await prisma.user.delete({
      where: {id: params.userId},
    });

    return new NextResponse(null, {status: 204});
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({error: "Cliente no encontrado."}, {status: 404});
    }

    console.error(`Error eliminando al cliente ${params.userId}:`, error);

    return NextResponse.json({error: "No se pudo eliminar al cliente."}, {status: 500});
  }
}
