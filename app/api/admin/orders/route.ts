import {NextResponse} from "next/server";

import {getAdminSession} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseNumberParam(value: string | null, fallback: number, min = 1) {
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < min) {
    return fallback;
  }

  return Math.floor(parsed);
}

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({error: "No autorizado."}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const page = parseNumberParam(searchParams.get("page"), 1);
    const perPage = parseNumberParam(searchParams.get("perPage"), 10);
    const skip = (page - 1) * perPage;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: perPage,
        orderBy: {createdAt: "desc"},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      orders,
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({error: "No se pudieron obtener las órdenes."}, {status: 500});
  }
}
