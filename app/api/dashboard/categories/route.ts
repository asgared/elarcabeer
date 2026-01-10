import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Nombre y slug son obligatorios" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name, slug }
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        if ((error as any).code === "P2002") {
            return NextResponse.json({ error: "Ya existe una categoría con este nombre o slug" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, slug } = body;

        if (!id || !name || !slug) {
            return NextResponse.json({ error: "ID, nombre y slug son obligatorios" }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id },
            data: { name, slug }
        });

        return NextResponse.json({ category });
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID de categoría es obligatorio" }, { status: 400 });
        }

        // Verificar si tiene productos vinculados
        const count = await prisma.product.count({
            where: {
                categories: {
                    some: { id }
                }
            }
        });

        if (count > 0) {
            return NextResponse.json({ error: "No se puede eliminar una categoría con productos asociados" }, { status: 400 });
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Categoría eliminada" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
