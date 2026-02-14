import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getAdminSession, sessionHasRole } from "@/lib/auth/admin";
import { SUPERADMIN_KEY } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

import { ZodError } from "zod";

import { cmsContentSchema } from "./validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY, "content_editor")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const entries = await prisma.cmsContent.findMany({ orderBy: { updatedAt: "desc" } });

  return NextResponse.json({
    content: entries.map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      subtitle: entry.subtitle,
      body: entry.body,
      imageUrl: entry.imageUrl,
      socialLinks: entry.socialLinks,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session || !sessionHasRole(session, SUPERADMIN_KEY, "content_editor")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const json = await request.json();
    const payload = cmsContentSchema.parse(json);

    const socialLinks =
      payload.socialLinks && payload.socialLinks.length > 0
        ? (payload.socialLinks as Prisma.InputJsonValue)
        : Prisma.JsonNull;

    const entry = await prisma.cmsContent.create({
      data: {
        slug: payload.slug,
        title: payload.title,
        subtitle: payload.subtitle || null,
        body: payload.body || null,
        imageUrl: payload.imageUrl || null,
        socialLinks,
      },
    });

    return NextResponse.json({ content: entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating CMS content", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "No se pudo crear el contenido." }, { status: 500 });
  }
}
