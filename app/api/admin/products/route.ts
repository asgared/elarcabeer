import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";

import {prisma} from "@/lib/prisma";
import {createRouteSupabaseClient} from "@/lib/supabase/route";

type CreateProductPayload = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  style?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function requireSession() {
  const supabase = createRouteSupabaseClient();
  const {
    data: {session}
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({error: "No autorizado"}, {status: 401});
  }

  const products = await prisma.product.findMany({
    orderBy: {createdAt: "desc"},
    include: {variants: true}
  });

  return NextResponse.json({products});
}

export async function POST(request: Request) {
  const session = await requireSession();

  if (!session) {
    return NextResponse.json({error: "No autorizado"}, {status: 401});
  }

  try {
    const payload = (await request.json()) as Partial<CreateProductPayload>;

    if (!payload.name || !payload.description || !payload.imageUrl || typeof payload.price !== "number") {
      return NextResponse.json({error: "Datos de producto incompletos"}, {status: 400});
    }

    const slugBase = slugify(payload.name);
    const slug = slugBase || slugify(`${payload.name}-${Date.now()}`);

    const product = await prisma.product.create({
      data: {
        name: payload.name,
        description: payload.description,
        slug,
        style: payload.style ?? "Especial",
        rating: 0,
        heroImage: payload.imageUrl,
        imageUrl: payload.imageUrl,
        variants: {
          create: {
            name: "Presentación estándar",
            abv: 5,
            ibu: 0,
            packSize: 1,
            price: Math.round(payload.price)
          }
        }
      },
      include: {variants: true}
    });

    return NextResponse.json({product}, {status: 201});
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({error: "Ya existe un producto con ese identificador"}, {status: 409});
    }

    console.error("Error creating product", error);
    return NextResponse.json({error: "No se pudo crear el producto"}, {status: 500});
  }
}

