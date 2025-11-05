import type { Prisma } from "@prisma/client";

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { variants: true };
}>;

export function parseJsonField(
  value: unknown,
  fieldName: string,
  fallback: Prisma.InputJsonValue = {}
): Prisma.InputJsonValue {
  if (typeof value === "undefined" || value === null) {
    return fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (parsed === null) {
        return fallback;
      }

      if (typeof parsed === "object") {
        return parsed as Prisma.InputJsonValue;
      }

      throw new Error();
    } catch (error) {
      throw new Error(`El campo ${fieldName} debe contener un JSON válido.`);
    }
  }

  if (typeof value === "object") {
    return value as Prisma.InputJsonValue;
  }

  throw new Error(`El campo ${fieldName} debe contener un JSON válido.`);
}

export function mapProductForResponse(product: ProductWithVariants) {
  const primaryVariant = product.variants[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    type: product.type,
    style: product.style,
    rating: product.rating,
    limitedEdition: product.limitedEdition,
    categoryLabel: product.categoryLabel,
    metadata: product.metadata,
    images: product.images,
    price: primaryVariant?.price ?? 0,
    stock: primaryVariant?.stock ?? 0,
    sku: primaryVariant?.sku ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
