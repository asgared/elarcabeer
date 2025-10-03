import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";

import {prisma} from "@/lib/prisma";
import {hashPassword} from "@/utils/auth";

import {getUserById, serializeUser, userInclude} from "../utils";
import {ValidationError, validateUpdateUserPayload} from "../validation";

export const dynamic = "force-dynamic";

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
    const payload = validateUpdateUserPayload(await request.json());

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

    if (payload.addresses !== undefined) {
      const sanitizedAddresses = payload.addresses.map(({label, street, city, country, postal}) => ({
        label: label.trim(),
        street: street.trim(),
        city: city.trim(),
        country: country.trim(),
        postal: postal.trim()
      }));

      updateData.addresses = {
        deleteMany: {userId},
        ...(sanitizedAddresses.length ? {create: sanitizedAddresses} : {})
      };
    }

    const user = await prisma.user.update({
      where: {id: userId},
      data: updateData,
      include: userInclude
    });

    return NextResponse.json({user: serializeUser(user)});
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({error: "Usuario no encontrado."}, {status: 404});
    }

    console.error("Error updating user", error);
    return NextResponse.json({error: "No se pudo actualizar el perfil."}, {status: 500});
  }
}
