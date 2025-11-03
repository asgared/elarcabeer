import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "../../../../../dashboard/blog/validation";

export const dynamic = "force-dynamic";

// --- PUT (Actualizar) ---
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
    // Omitimos 'slug' de la validación PUT, ya que no se puede cambiar
    const payload = blogPostSchema.omit({ slug: true }).parse(json);
    const post = await prisma.contentPost.update({
      where: { slug },
      data: payload, // 'published' ya es un objeto Date
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error(`Error updating post ${params.slug}:`, error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "No se pudo actualizar el post." }, { status: 500 });
  }
}

// --- DELETE (Eliminar) ---
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
    await prisma.contentPost.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting post ${params.slug}:`, error);
    return NextResponse.json({ error: "No se pudo eliminar el post." }, { status: 500 });
  }
}
