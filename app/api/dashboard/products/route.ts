import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { productInputSchema } from "@/lib/validations/product";

import { mapProductForResponse, parseJsonField } from "./utils";

function normalizeStringArray(values: string[] = []): string[] {
  return values
    .map((value) => value.trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
}

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

    const {
      variants,
      tastingNotes = [],
      suggestedPairings = [],
      metadata,
      images,
      ...productData
    } = validation.data;

    const normalizedTastingNotes = normalizeStringArray(tastingNotes);
    const normalizedPairings = normalizeStringArray(suggestedPairings);
    const normalizedVariants = variants.map((variant) => ({
      id: variant.id,
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      price: variant.price,
      stock: variant.stock,
    }));

    let metadataValue;
    let imagesValue;

    try {
      metadataValue = parseJsonField(metadata, "metadata");
      imagesValue = parseJsonField(images, "images");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos JSON inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const metadataRecord =
      metadataValue && typeof metadataValue === "object" && !Array.isArray(metadataValue)
        ? { ...(metadataValue as Record<string, unknown>) }
        : {};

    delete metadataRecord.tastingNotes;
    delete metadataRecord.tasting_notes;
    delete metadataRecord.suggestedPairings;
    delete metadataRecord.suggested_pairings;
    delete metadataRecord.pairings;

    const metadataWithAttributes = {
      ...metadataRecord,
      tastingNotes: normalizedTastingNotes,
      suggestedPairings: normalizedPairings,
    };

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name: productData.name,
          slug: productData.slug,
          description: productData.description ?? null,
          type: productData.type,
          style: productData.style ?? null,
          rating: typeof productData.rating === "number" ? productData.rating : null,
          limitedEdition: productData.limitedEdition ?? false,
          categoryLabel: productData.categoryLabel ?? null,
          metadata: metadataWithAttributes,
          images: imagesValue,
        },
      });

      if (variants.length > 0) {
        await tx.variant.createMany({
          data: normalizedVariants.map((variant) => ({
            productId: createdProduct.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: createdProduct.id },
        include: { variants: { orderBy: { name: "asc" } } },
      });
    });

    if (!product) {
      throw new Error("No se pudo crear el producto.");
    }

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
