import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { productInputSchema } from "@/lib/validations/product";

import { mapProductForResponse, parseJsonField } from "./utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { variants: { orderBy: { name: "asc" } } },
    });

    return NextResponse.json({
      products: products.map(mapProductForResponse),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    const message =
      error instanceof Error ? error.message : "No se pudieron obtener los productos.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validation = productInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const data = validation.data;

    let metadataValue;
    let imagesValue;

    try {
      metadataValue = parseJsonField(data.metadata, "metadata");
      imagesValue = parseJsonField(data.images, "images");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos JSON inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        type: data.type,
        style: data.style ?? null,
        rating: typeof data.rating === "number" ? data.rating : null,
        limitedEdition: data.limitedEdition ?? false,
        categoryLabel: data.categoryLabel ?? null,
        metadata: metadataValue,
        images: imagesValue,
        variants: {
          create: {
            name: data.name,
            sku: data.sku,
            price: data.price,
            stock: data.stock,
          },
        },
      },
      include: { variants: { orderBy: { name: "asc" } } },
    });

    return NextResponse.json(
      { product: mapProductForResponse(product) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    const message = error instanceof Error ? error.message : "No se pudo crear el producto.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
