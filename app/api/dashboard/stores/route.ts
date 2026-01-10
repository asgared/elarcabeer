import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const stores = await prisma.store.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { upcomingEvents: true }
                }
            }
        });

        return NextResponse.json({ stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
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
        const {
            name, slug, address, latitude, longitude,
            petFriendly, kitchen, events, hours, menuUrl
        } = body;

        if (!name || !slug || !address || !hours) {
            return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
        }

        const store = await prisma.store.create({
            data: {
                name,
                slug,
                address,
                latitude: parseFloat(latitude) || 0,
                longitude: parseFloat(longitude) || 0,
                petFriendly: !!petFriendly,
                kitchen: !!kitchen,
                events: !!events,
                hours,
                menuUrl: menuUrl || null
            }
        });

        return NextResponse.json({ store }, { status: 201 });
    } catch (error) {
        console.error("Error creating store:", error);
        if ((error as any).code === "P2002") {
            return NextResponse.json({ error: "Ya existe una sucursal con este nombre o slug" }, { status: 400 });
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
        const {
            id, name, slug, address, latitude, longitude,
            petFriendly, kitchen, events, hours, menuUrl
        } = body;

        if (!id || !name || !slug || !address || !hours) {
            return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
        }

        const store = await prisma.store.update({
            where: { id },
            data: {
                name,
                slug,
                address,
                latitude: parseFloat(latitude) || 0,
                longitude: parseFloat(longitude) || 0,
                petFriendly: !!petFriendly,
                kitchen: !!kitchen,
                events: !!events,
                hours,
                menuUrl: menuUrl || null
            }
        });

        return NextResponse.json({ store });
    } catch (error) {
        console.error("Error updating store:", error);
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
            return NextResponse.json({ error: "ID de sucursal es obligatorio" }, { status: 400 });
        }

        await prisma.store.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Sucursal eliminada" });
    } catch (error) {
        console.error("Error deleting store:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
