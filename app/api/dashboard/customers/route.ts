import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const customers = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        orders: true,
                        loyalty: true
                    }
                },
                loyalty: {
                    orderBy: { createdAt: "desc" },
                    take: 5
                }
            }
        });

        return NextResponse.json({ customers });
    } catch (error) {
        console.error("Error fetching customers:", error);
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
        const { id, name, lastName } = body;

        if (!id) {
            return NextResponse.json({ error: "ID de cliente es obligatorio" }, { status: 400 });
        }

        const customer = await prisma.user.update({
            where: { id },
            data: {
                name: name || undefined,
                lastName: lastName || undefined
            }
        });

        return NextResponse.json({ customer });
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

// Loyalty specific endpoint (internal handling)
export async function POST(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, points, reason } = body;

        if (!userId || points === undefined || !reason) {
            return NextResponse.json({ error: "Datos de lealtad incompletos" }, { status: 400 });
        }

        const ledgerEntry = await prisma.loyaltyLedger.create({
            data: {
                userId,
                points: parseInt(points),
                reason
            }
        });

        return NextResponse.json({ ledgerEntry }, { status: 201 });
    } catch (error) {
        console.error("Error adjusting loyalty points:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
