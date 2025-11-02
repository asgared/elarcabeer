import {NextResponse} from "next/server";
import {z} from "zod";

import {Prisma} from "@prisma/client";

import {requireAdmin} from "@/lib/auth/admin";
import {prisma} from "@/lib/prisma";

// --- CAMBIOS AQUÍ ---

// 1. Definir el esquema para los atributos JSON de la variante
const variantAttributesSchema = z
  .object({
    unit_count: z.number().int().min(1).optional().nullable(),
    packSize: z.number().int().min(1).optional().nullable(),
    abv: z.number().min(0).optional().nullable(),
    ibu: z.number().int().min(0).optional().nullable(),
  })
  .passthrough(); // Permite otros campos que no validemos explícitamente

// 2. Actualizar el esquema de la variante para que coincida con el payload del frontend
const variantSchema = z.object({
  sku: z.string().min(1, "El SKU de la variante es requerido."),
  name: z.string().min(1, "El nombre de la variante es requerido."),
  price: z.number().int().min(0, "El precio no puede ser negativo."),
  stock: z.number().int().min(0, "El stock no puede ser negativo."), // <-- AÑADIDO
  attributes: variantAttributesSchema, // <-- AÑADIDO
  // 'packSize', 'abv', 'ibu' eliminados de la raíz de la variante
});

// 3. Actualizar el esquema principal del producto
const updateProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  slug: z.string().min(1, "El slug es requerido."),
  sku: z.string().min(1, "El SKU es requerido."), // El frontend aún envía esto
  description: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  limitedEdition: z.boolean().optional(),
  categoryLabel: z.string().optional().nullable(),

  // CAMPOS JSON NUEVOS (en lugar de los campos raíz antiguos)
  metadata: z.record(z.unknown()),
  images: z.record(z.unknown()),

  // ARRAY DE VARIANTES ACTUALIZADO
  variants: z.array(variantSchema).default([]),

  // --- CAMPOS ANTIGUOS ELIMINADOS DE LA RAÍZ ---
  // price, stock, imageUrl, tastingNotes, pairings, gallery
});
// --- FIN DE CAMBIOS EN ESQUEMAS ---

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

// ... (Las funciones 'buildVariantAttributes' y 'extractVariantAttributes' ya no son
// estrictamente necesarias para el 'update', pero 'mapProductForResponse' aún las usa,
// así que las dejamos. Solo necesitamos 'extractVariantAttributes' y 'map...')

function extractVariantAttributes(attributes: Prisma.JsonValue | null | undefined) {
  if (!isRecord(attributes)) {
    return {} as VariantAttributes;
  }

  // El frontend guarda 'packSize' o 'unit_count', normalizamos al leer
  const packSizeSource = attributes.packSize ?? attributes.unit_count;
  const packSize = Number(packSizeSource);
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

  // El frontend guarda 'tasting_notes', pero normalizamos al leer
  const tastingNotesList = metadata.tasting_notes ?? metadata.tastingNotes;
  const pairingsList = metadata.pairings;

  const tastingNotes = Array.isArray(tastingNotesList)
    ? tastingNotesList.filter((note): note is string => typeof note === "string")
    : [];
  const pairings = Array.isArray(pairingsList)
    ? pairingsList.filter((pairing): pairing is string => typeof pairing === "string")
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

// --- CAMBIOS GRANDES AQUÍ ---

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
    });

    if (!existingProduct) {
      return NextResponse.json({error: "Producto no encontrado."}, {status: 404});
    }

    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    // Aquí es donde estabas recibiendo el 400
    if (!validation.success) {
      console.error("Fallo en validación Zod:", validation.error.flatten());
      return NextResponse.json({error: validation.error.flatten()}, {status: 400});
    }

    // Los datos ya vienen en el nuevo formato desde el frontend
    const {
      name,
      slug,
      description,
      style,
      rating,
      limitedEdition,
      categoryLabel,
      metadata, // <-- Directo
      images,   // <-- Directo
      variants, // <-- Directo
    } = validation.data;

    // Convertimos a Prisma.InputJsonValue
    const metadataValue = toJsonValue(metadata);
    const imagesValue = toJsonValue(images);

    // El frontend ya preparó las variantes.
    // Solo estandarizamos 'packSize' en la BD
    const preparedVariants = [...variants].map((variant) => {
      const attributes = variant.attributes;
      const packSize = attributes.unit_count ?? attributes.packSize ?? null;

      return {
        sku: variant.sku,
        name: variant.name,
        price: variant.price, // Ya en centavos
        stock: variant.stock, // Ya en la variante
        attributes: toJsonValue({
          abv: attributes.abv ?? null,
          ibu: attributes.ibu ?? null,
          packSize: packSize,
        }),
      };
    });

    // La lógica de `unshift` que usaba el 'sku', 'price' y 'stock' raíz
    // ya no es necesaria, pues el frontend ya no envía 'price' y 'stock' raíz.
    // Asumimos que `variants` es la única fuente de verdad.

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Borrar variantes antiguas
      await tx.variant.deleteMany({where: {productId: id}});

      // 2. Actualizar el producto
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

      // 3. Crear las nuevas variantes
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

      // 4. Devolver el producto actualizado
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

// ... (DELETE se mantiene igual) ...

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