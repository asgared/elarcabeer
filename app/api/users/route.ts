import {NextResponse} from "next/server";
import {z, ZodError} from "zod";

import {prisma} from "@/lib/prisma";
import {hashPassword} from "@/utils/auth";

import {serializeUser, userInclude} from "./utils";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  postal: z.string().min(1)
});

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
  password: z.string().min(8),
  addresses: z.array(addressSchema).optional()
});

export async function POST(request: Request) {
  try {
    const payload = createUserSchema.parse(await request.json());

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
    if (error instanceof ZodError) {
      return NextResponse.json({error: error.flatten()}, {status: 400});
    }

    console.error("Error creating user", error);
    return NextResponse.json({error: "No se pudo crear la cuenta."}, {status: 500});
  }
}
