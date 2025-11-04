import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { storeSchema } from "@/lib/validations/store";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const slug = params.slug;
    const json = await request.json();

    const payload = storeSchema.omit({ slug: true }).parse(json);

    const dataForPrisma = {
      ...payload,
      menuUrl: payload.menuUrl || null,
    };

    const store = await prisma.store.update({
      where: { slug },
      data: dataForPrisma,
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error(`Error updating store ${params.slug}:`, error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "No se pudo actualizar la tienda." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const slug = params.slug;

    await prisma.store.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting store ${params.slug}:`, error);

    return NextResponse.json({ error: "No se pudo eliminar la tienda." }, { status: 500 });
  }
}
