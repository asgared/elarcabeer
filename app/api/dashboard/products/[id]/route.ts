import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validations/product";

import { mapProductForResponse, parseJsonField } from "../utils";

function normalizeStringArray(values: string[] = []): string[] {
  return values
    .map((value) => value.trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
}

function buildMissingIdResponse() {
  return NextResponse.json(
    { error: "Identificador del producto no especificado." },
    { status: 400 }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    await requireAdmin();

    const id = params.id;

    if (!id) {
      return buildMissingIdResponse();
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { name: "asc" } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ product: mapProductForResponse(product) });
  } catch (error) {
    console.error("Error fetching product:", error);

    const message = error instanceof Error ? error.message : "No se pudo obtener el producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    await requireAdmin();

    const id = params.id;

    if (!id) {
      return buildMissingIdResponse();
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { name: "asc" } } },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

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
      id: variant.id?.trim(),
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      price: variant.price,
      stock: variant.stock,
    }));

    let metadataValue;
    let imagesValue;

    try {
      const parsedMetadata =
        typeof metadata === "undefined"
          ? (existingProduct.metadata as Prisma.InputJsonValue)
          : parseJsonField(
              metadata,
              "metadata",
              existingProduct.metadata as Prisma.InputJsonValue,
            );

      const metadataRecord =
        parsedMetadata && typeof parsedMetadata === "object" && !Array.isArray(parsedMetadata)
          ? { ...(parsedMetadata as Record<string, unknown>) }
          : {};

      delete metadataRecord.tastingNotes;
      delete metadataRecord.tasting_notes;
      delete metadataRecord.suggestedPairings;
      delete metadataRecord.suggested_pairings;
      delete metadataRecord.pairings;

      metadataValue = {
        ...metadataRecord,
        tastingNotes: normalizedTastingNotes,
        suggestedPairings: normalizedPairings,
      };

      imagesValue =
        typeof images === "undefined"
          ? (existingProduct.images as Prisma.InputJsonValue)
          : parseJsonField(
              images,
              "images",
              existingProduct.images as Prisma.InputJsonValue,
            );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos JSON inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: productData.name,
          slug: productData.slug,
          description: productData.description ?? null,
          type: productData.type,
          style: productData.style ?? null,
          rating: typeof productData.rating === "number" ? productData.rating : null,
          limitedEdition:
            typeof productData.limitedEdition === "boolean"
              ? productData.limitedEdition
              : existingProduct.limitedEdition,
          categoryLabel: productData.categoryLabel ?? null,
          metadata: metadataValue,
          images: imagesValue,
        },
      });

      const incomingVariants = normalizedVariants;
      const incomingIds = incomingVariants
        .map((variant) => variant.id)
        .filter((variantId): variantId is string => typeof variantId === "string" && variantId.length > 0);

      const variantsToDelete = existingProduct.variants
        .map((variant) => variant.id)
        .filter((variantId) => !incomingIds.includes(variantId));

      if (variantsToDelete.length > 0) {
        await tx.variant.deleteMany({
          where: {
            productId: id,
            id: { in: variantsToDelete },
          },
        });
      }

      await Promise.all(
        incomingVariants.map((variant) => {
          const variantData = {
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          };

          if (variant.id) {
            return tx.variant.upsert({
              where: { id: variant.id },
              update: variantData,
              create: {
                productId: id,
                ...variantData,
              },
            });
          }

          return tx.variant.create({
            data: {
              productId: id,
              ...variantData,
            },
          });
        }),
      );

      return tx.product.findUnique({
        where: { id },
        include: { variants: { orderBy: { name: "asc" } } },
      });
    });

    if (!updatedProduct) {
      throw new Error("No se pudo actualizar el producto.");
    }

    return NextResponse.json({ product: mapProductForResponse(updatedProduct) });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : "No se pudo actualizar el producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    await requireAdmin();

    const id = params.id;

    if (!id) {
      return buildMissingIdResponse();
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : "No se pudo eliminar el producto.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
