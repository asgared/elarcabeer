import type { Prisma } from "@prisma/client";

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { variants: true };
}>;

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }

  return [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function resolveStructuredArray(
  source: Record<string, unknown> | null,
  keys: string[],
): string[] {
  if (!source) {
    return [];
  }

  for (const key of keys) {
    if (key in source) {
      const array = toStringArray(source[key]);

      if (array.length > 0) {
        return array;
      }
    }
  }

  return [];
}

export function parseJsonField(
  value: unknown,
  fieldName: string,
  fallback: Prisma.InputJsonValue = {},
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
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
  }));

  const primaryVariant = variants[0];

  const productRecord = asRecord(product);
  const metadataRecord = asRecord(product.metadata);

  const tastingNotes =
    resolveStructuredArray(productRecord, ["tastingNotes", "tasting_notes"]) ||
    resolveStructuredArray(metadataRecord, ["tastingNotes", "tasting_notes"]);
  const suggestedPairings =
    resolveStructuredArray(productRecord, [
      "suggestedPairings",
      "pairings",
      "suggested_pairings",
    ]) ||
    resolveStructuredArray(metadataRecord, [
      "suggestedPairings",
      "pairings",
      "suggested_pairings",
    ]);

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
    tastingNotes,
    suggestedPairings,
    variants,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
