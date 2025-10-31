import type { Prisma } from "@prisma/client";

import { products as fallbackProducts } from "@/data/products";
import type { Product, Variant } from "@/types/catalog";
import { prisma } from "./prisma";

type PrismaProductWithVariants = Prisma.ProductGetPayload<{
  include: { variants: true };
}>;

function mapVariants(
  recordVariants: PrismaProductWithVariants["variants"],
  fallback?: Variant[],
): Variant[] {
  if (recordVariants.length > 0) {
    return recordVariants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      // @ts-ignore
      abv: typeof variant.abv === "number" ? variant.abv : 0,
      // @ts-ignore
      ibu: typeof variant.ibu === "number" ? variant.ibu : 0,
      // @ts-ignore
      packSize: typeof variant.packSize === "number" ? variant.packSize : 1,
      price: variant.price,
    }));
  }

  return fallback ?? [];
}

function mapProductRecord(
  record: PrismaProductWithVariants,
  fallback?: Product,
): Product {
  const recordImages = (record.images as
    | { main?: unknown; gallery?: unknown }
    | null
    | undefined) ?? { main: undefined, gallery: undefined };
  const heroImage =
    (typeof recordImages.main === "string" ? recordImages.main : undefined) ??
    fallback?.heroImage ??
    "/images/beer-bg.jpg";
  const gallerySource =
    Array.isArray(recordImages.gallery) && recordImages.gallery.length > 0
      ? recordImages.gallery.filter(
          (image): image is string => typeof image === "string",
        )
      : fallback?.gallery && fallback.gallery.length > 0
      ? fallback.gallery
      : [heroImage];

  const tastingNotes =
    record.tastingNotes.length > 0
      ? record.tastingNotes
      : fallback?.tastingNotes ?? [];
  const pairings =
    record.pairings.length > 0 ? record.pairings : fallback?.pairings ?? [];

  return {
    id: record.id,
    slug: record.slug,
    name: record.name ?? fallback?.name ?? "Producto",
    // @ts-ignore
    category: record.categoryLabel ?? fallback?.category ?? "Catálogo",
    style: record.style ?? fallback?.style ?? "",
    description: record.description ?? fallback?.description ?? "",
    tastingNotes,
    pairings,
    ingredients: fallback?.ingredients ?? [],
    rating: typeof record.rating === "number" ? record.rating : fallback?.rating ?? 0,
    limitedEdition: record.limitedEdition ?? fallback?.limitedEdition ?? false,
    heroImage,
    gallery: gallerySource,
    variants: mapVariants(record.variants, fallback?.variants),
  };
}

// =================================================================
// FUNCIÓN AÑADIDA
// =================================================================
export async function getProducts(): Promise<Product[]> {
  try {
    const records = await prisma.product.findMany({
      include: { variants: true },
    });

    // Combina los productos de la BD con los hardcodeados
    const dbSlugs = new Set(records.map(r => r.slug));
    const allProducts = [
      ...records.map(record => mapProductRecord(record)),
      ...fallbackProducts.filter(p => !dbSlugs.has(p.slug))
    ];

    return allProducts;
  } catch (error) {
    console.error("Error fetching products from DB, returning fallback data.", error);
    return fallbackProducts;
  }
}
// =================================================================

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const fallback = fallbackProducts.find((product) => product.slug === slug);

  try {
    const record = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });

    if (!record) {
      return fallback ?? null;
    }

    return mapProductRecord(record, fallback);
  } catch (error) {
    console.error(`Error fetching product ${slug} from DB, returning fallback data.`, error);
    return fallback ?? null;
  }
}