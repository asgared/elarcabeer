import {NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";
import {hashPassword} from "@/utils/auth";

import {serializeUser, userInclude} from "./utils";
import {ValidationError, validateCreateUserPayload} from "./validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = validateCreateUserPayload(await request.json());

    const existingUser = await prisma.user.findUnique({where: {email: payload.email}});

    if (existingUser) {
      return NextResponse.json({error: "El correo ya está registrado."}, {status: 409});
    }

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name ?? null,
        password: hashPassword(payload.password),
        addresses: payload.addresses
          ? {
              create: payload.addresses.map(({label, street, city, country, postal}) => ({
                label,
                street,
                city,
                country,
                postal
              }))
            }
          : undefined
      },
      include: userInclude
    });

    return NextResponse.json({user: serializeUser(user)}, {status: 201});
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    console.error("Error creating user", error);
    return NextResponse.json({error: "No se pudo crear la cuenta."}, {status: 500});
  }
}
