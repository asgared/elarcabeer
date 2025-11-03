import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "../../../dashboard/blog/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const json = await request.json();
    const payload = blogPostSchema.parse(json);
    // 'payload' ya está validado y 'published' es un objeto Date
    const post = await prisma.contentPost.create({
      data: payload,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return NextResponse.json(
        { error: "Ya existe un post con este slug." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "No se pudo crear el post." }, { status: 500 });
  }
}
