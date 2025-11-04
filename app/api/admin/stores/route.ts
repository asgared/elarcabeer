import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { storeSchema } from "@/lib/validations/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const json = await request.json();
    const payload = storeSchema.parse(json);

    const dataForPrisma = {
      ...payload,
      menuUrl: payload.menuUrl || null,
    };

    const store = await prisma.store.create({
      data: dataForPrisma,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return NextResponse.json({ error: "Ya existe una tienda con este slug." }, { status: 409 });
    }

    return NextResponse.json({ error: "No se pudo crear la tienda." }, { status: 500 });
  }
}
