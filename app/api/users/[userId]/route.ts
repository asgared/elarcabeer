import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {z, ZodError} from "zod";

import {prisma} from "@/lib/prisma";
import {hashPassword} from "@/utils/auth";

import {getUserById, serializeUser, userInclude} from "../utils";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  postal: z.string().min(1)
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(120).nullable().optional(),
  password: z.string().min(8).optional(),
  addresses: z.array(addressSchema).optional()
});

type RouteContext = {
  params: {userId: string};
};

export async function GET(_request: Request, {params}: RouteContext) {
  const {userId} = params;

  if (!userId) {
    return NextResponse.json({error: "Falta el identificador de usuario."}, {status: 400});
  }

  const user = await getUserById(userId);

  if (!user) {
    return NextResponse.json({error: "Usuario no encontrado."}, {status: 404});
  }

  return NextResponse.json({user: serializeUser(user)});
}

export async function PATCH(request: Request, {params}: RouteContext) {
  const {userId} = params;

  if (!userId) {
    return NextResponse.json({error: "Falta el identificador de usuario."}, {status: 400});
  }

  try {
    const payload = updateUserSchema.parse(await request.json());

    const updateData: Prisma.UserUpdateInput = {};

    if (payload.name !== undefined) {
      updateData.name = payload.name;
    }

    if (payload.email) {
      updateData.email = payload.email;
    }

    if (payload.password) {
      updateData.password = hashPassword(payload.password);
    }

    if (payload.addresses) {
      updateData.addresses = {
        deleteMany: {userId},
        ...(payload.addresses.length
          ? {
              create: payload.addresses.map(({label, street, city, country, postal}) => ({
                label,
                street,
                city,
                country,
                postal
              }))
            }
          : {})
      };
    }

    const user = await prisma.user.update({
      where: {id: userId},
      data: updateData,
      include: userInclude
    });

    return NextResponse.json({user: serializeUser(user)});
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({error: "Usuario no encontrado."}, {status: 404});
    }

    console.error("Error updating user", error);
    return NextResponse.json({error: "No se pudo actualizar el perfil."}, {status: 500});
  }
}
