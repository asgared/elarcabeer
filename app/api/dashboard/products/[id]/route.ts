import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validations/product";

import { mapProductForResponse, parseJsonField } from "../utils";

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
      include: { variants: { orderBy: { createdAt: "asc" } } },
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
      include: { variants: { orderBy: { createdAt: "asc" } } },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const validation = productInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const data = validation.data;

    let metadataValue;
    let imagesValue;

    try {
      metadataValue =
        typeof data.metadata === "undefined"
          ? (existingProduct.metadata as Prisma.InputJsonValue)
          : parseJsonField(
              data.metadata,
              "metadata",
              existingProduct.metadata as Prisma.InputJsonValue
            );

      imagesValue =
        typeof data.images === "undefined"
          ? (existingProduct.images as Prisma.InputJsonValue)
          : parseJsonField(
              data.images,
              "images",
              existingProduct.images as Prisma.InputJsonValue
            );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos JSON inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const primaryVariant = existingProduct.variants[0] ?? null;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          type: data.type,
          style: data.style ?? null,
          rating: typeof data.rating === "number" ? data.rating : null,
          limitedEdition:
            typeof data.limitedEdition === "boolean"
              ? data.limitedEdition
              : existingProduct.limitedEdition,
          categoryLabel: data.categoryLabel ?? null,
          metadata: metadataValue,
          images: imagesValue,
        },
      });

      if (primaryVariant) {
        await tx.variant.update({
          where: { id: primaryVariant.id },
          data: {
            name: data.name,
            sku: data.sku,
            price: data.price,
            stock: data.stock,
          },
        });
      } else {
        await tx.variant.create({
          data: {
            productId: id,
            name: data.name,
            sku: data.sku,
            price: data.price,
            stock: data.stock,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: { variants: { orderBy: { createdAt: "asc" } } },
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
