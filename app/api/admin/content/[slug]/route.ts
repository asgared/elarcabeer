import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAdminSession, sessionHasRole } from "@/lib/auth/admin";
import { SUPERADMIN_KEY } from "@/lib/auth/permissions";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cmsContentSchema } from "../validation";

type RouteContext = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY, "content_editor")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const entry = await prisma.cmsContent.findUnique({ where: { slug: params.slug } });

  if (!entry) {
    return NextResponse.json({ error: "Contenido no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ content: entry });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY, "content_editor")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const payload = cmsContentSchema.parse({ ...json, slug: params.slug });

    const socialLinks =
      payload.socialLinks && payload.socialLinks.length > 0
        ? (payload.socialLinks as Prisma.InputJsonValue)
        : Prisma.JsonNull;

    const entry = await prisma.cmsContent.update({
      where: { slug: params.slug },
      data: {
        title: payload.title,
        subtitle: payload.subtitle || null,
        body: payload.body || null,
        imageUrl: payload.imageUrl || null,
        socialLinks,
      },
    });

    return NextResponse.json({ content: entry });
  } catch (error) {
    console.error("Error updating CMS content", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Contenido no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ error: "No se pudo actualizar el contenido." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY, "content_editor")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    await prisma.cmsContent.delete({ where: { slug: params.slug } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Contenido no encontrado." }, { status: 404 });
    }

    console.error("Error deleting CMS content", error);
    return NextResponse.json({ error: "No se pudo eliminar el contenido." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
