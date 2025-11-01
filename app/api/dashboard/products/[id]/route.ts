import {NextResponse} from "next/server";
import {z} from "zod";

import {Prisma} from "@prisma/client";

import {requireAdmin} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";

const variantSchema = z.object({
  sku: z.string().min(1, "El SKU de la variante es requerido."),
  name: z.string().min(1, "El nombre de la variante es requerido."),
  price: z.number().int().min(0, "El precio no puede ser negativo."),
  packSize: z.number().int().min(1, "El tamaño del paquete debe ser al menos 1.").optional(),
  abv: z.number().min(0, "El ABV no puede ser negativo.").optional(),
  ibu: z.number().int().min(0, "El IBU no puede ser negativo.").optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  slug: z.string().min(1, "El slug es requerido."),
  sku: z.string().min(1, "El SKU es requerido."),
  description: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  limitedEdition: z.boolean().optional(),
  categoryLabel: z.string().optional().nullable(),
  imageUrl: z.string().url("La URL de la imagen no es válida."),
  tastingNotes: z.array(z.string()).default([]),
  pairings: z.array(z.string()).default([]),
  gallery: z.array(z.string().url("La URL de la imagen no es válida.")).default([]),
  price: z.number().int().min(0, "El precio no puede ser negativo."),
  stock: z.number().int().min(0, "El stock no puede ser negativo."),
  variants: z.array(variantSchema).default([]),
});

type ProductWithVariants = Prisma.ProductGetPayload<{
  include: {variants: true};
}>;

type VariantAttributes = {
  packSize?: number | null;
  abv?: number | null;
  ibu?: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function buildVariantAttributes({packSize, abv, ibu}: VariantAttributes) {
  const attributes: Record<string, number | null> = {};

  if (typeof packSize !== "undefined") {
    attributes.packSize = packSize ?? null;
  }

  if (typeof abv !== "undefined") {
    attributes.abv = abv ?? null;
  }

  if (typeof ibu !== "undefined") {
    attributes.ibu = ibu ?? null;
  }

  return toJsonValue(attributes);
}

function extractVariantAttributes(attributes: Prisma.JsonValue | null | undefined) {
  if (!isRecord(attributes)) {
    return {} as VariantAttributes;
  }

  const packSize = Number(attributes.packSize);
  const abv = Number(attributes.abv);
  const ibu = Number(attributes.ibu);

  return {
    packSize: Number.isFinite(packSize) ? packSize : undefined,
    abv: Number.isFinite(abv) ? abv : undefined,
    ibu: Number.isFinite(ibu) ? ibu : undefined,
  } satisfies VariantAttributes;
}

function mapVariantForResponse(variant: ProductWithVariants["variants"][number]) {
  const {packSize, abv, ibu} = extractVariantAttributes(variant.attributes);

  return {
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
    packSize: packSize ?? null,
    abv: abv ?? null,
    ibu: ibu ?? null,
  };
}

function mapProductForResponse(product: ProductWithVariants) {
  const primaryVariant = product.variants[0];
  const metadata = isRecord(product.metadata) ? product.metadata : {};
  const images = isRecord(product.images) ? product.images : {};

  const tastingNotes = Array.isArray(metadata.tastingNotes)
    ? metadata.tastingNotes.filter((note): note is string => typeof note === "string")
    : [];
  const pairings = Array.isArray(metadata.pairings)
    ? metadata.pairings.filter((pairing): pairing is string => typeof pairing === "string")
    : [];
  const gallery = Array.isArray(images.gallery)
    ? images.gallery.filter((url): url is string => typeof url === "string")
    : [];

  return {
    ...product,
    sku: primaryVariant?.sku ?? null,
    price: primaryVariant?.price ?? null,
    stock: primaryVariant?.stock ?? null,
    imageUrl: typeof images.main === "string" ? images.main : null,
    gallery,
    tastingNotes,
    pairings,
    variants: product.variants.map(mapVariantForResponse),
  };
}

export async function GET(
  _request: Request,
  {params}: {params: {id?: string}},
): Promise<NextResponse> {
  try {
    await requireAdmin();

    const id = params.id;

    if (!id) {
      return NextResponse.json({error: "Identificador del producto no especificado."}, {status: 400});
    }

    const product = await prisma.product.findUnique({
      where: {id},
      include: {variants: true},
    });

    if (!product) {
      return NextResponse.json({error: "Producto no encontrado."}, {status: 404});
    }

    return NextResponse.json({product: mapProductForResponse(product)});
  } catch (error) {
    console.error("Error fetching product:", error);
    const message = error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({error: message}, {status: 500});
  }
}

async function updateProduct(
  request: Request,
  params: {id?: string},
): Promise<NextResponse> {
  try {
    await requireAdmin();

    const id = params.id;

    if (!id) {
      return NextResponse.json({error: "Identificador del producto no especificado."}, {status: 400});
    }

    const existingProduct = await prisma.product.findUnique({
      where: {id},
      include: {variants: true},
    });

    if (!existingProduct) {
      return NextResponse.json({error: "Producto no encontrado."}, {status: 404});
    }

    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({error: validation.error.flatten()}, {status: 400});
    }

    const {
      name,
      slug,
      sku,
      description,
      style,
      rating,
      limitedEdition,
      categoryLabel,
      imageUrl,
      tastingNotes,
      pairings,
      gallery,
      price,
      stock,
      variants,
    } = validation.data;

    const existingMetadata = isRecord(existingProduct.metadata) ? {...existingProduct.metadata} : {};
    const existingImages = isRecord(existingProduct.images) ? {...existingProduct.images} : {};

    const metadataValue = toJsonValue({
      ...existingMetadata,
      tastingNotes,
      pairings,
    });

    const imagesValue = toJsonValue({
      ...existingImages,
      main: imageUrl,
      gallery,
    });

    const preparedVariants = [...variants].map((variant) => ({
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      stock,
      attributes: buildVariantAttributes({
        packSize: variant.packSize,
        abv: variant.abv,
        ibu: variant.ibu,
      }),
    }));

    if (!preparedVariants.some((variant) => variant.sku === sku)) {
      preparedVariants.unshift({
        sku,
        name,
        price,
        stock,
        attributes: buildVariantAttributes({packSize: 1}),
      });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.variant.deleteMany({where: {productId: id}});

      await tx.product.update({
        where: {id},
        data: {
          name,
          slug,
          description: typeof description === "string" ? description : null,
          style: typeof style === "string" ? style : null,
          rating: typeof rating === "number" ? rating : null,
          limitedEdition:
            typeof limitedEdition === "boolean" ? limitedEdition : existingProduct.limitedEdition,
          categoryLabel: typeof categoryLabel === "string" ? categoryLabel : null,
          metadata: metadataValue,
          images: imagesValue,
        },
      });

      await Promise.all(
        preparedVariants.map((variant) =>
          tx.variant.create({
            data: {
              ...variant,
              productId: id,
            },
          }),
        ),
      );

      return tx.product.findUnique({
        where: {id},
        include: {variants: true},
      });
    });

    if (!updatedProduct) {
      return NextResponse.json({error: "No se pudo actualizar el producto."}, {status: 500});
    }

    return NextResponse.json({product: mapProductForResponse(updatedProduct)});
  } catch (error) {
    console.error("Error updating product:", error);
    const message = error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({error: message}, {status: 500});
  }
}

export async function PUT(request: Request, context: {params: {id?: string}}) {
  return updateProduct(request, context.params);
}

export async function PATCH(request: Request, context: {params: {id?: string}}) {
  return updateProduct(request, context.params);
}

export async function DELETE(
  _request: Request,
  {params}: {params: {id?: string}},
): Promise<NextResponse> {
  try {
    await requireAdmin();

    const id = params.id;

    if (!id) {
      return NextResponse.json({error: "Identificador del producto no especificado."}, {status: 400});
    }

    await prisma.product.delete({where: {id}});

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({error: "Producto no encontrado."}, {status: 404});
    }

    const message = error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({error: message}, {status: 500});
  }
}
