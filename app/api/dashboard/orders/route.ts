import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { email: true, name: true, lastName: true }
                },
                items: true,
                payment: true
            }
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
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
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ order });
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
