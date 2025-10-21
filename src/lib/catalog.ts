import type {Prisma} from "@prisma/client";

import {products as fallbackProducts} from "@/data/products";
import type {Product, Variant} from "@/types/catalog";
import {prisma} from "./prisma";

type PrismaProductWithVariants = Prisma.ProductGetPayload<{
  include: {variants: true};
}>;

function mapVariants(recordVariants: PrismaProductWithVariants["variants"], fallback?: Variant[]): Variant[] {
  if (recordVariants.length > 0) {
    return recordVariants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      abv: typeof variant.abv === "number" ? variant.abv : 0,
      ibu: typeof variant.ibu === "number" ? variant.ibu : 0,
      packSize: typeof variant.packSize === "number" ? variant.packSize : 1,
      price: variant.price
    }));
  }

  return fallback ?? [];
}

function mapProductRecord(record: PrismaProductWithVariants, fallback?: Product): Product {
  const heroImage = record.imageUrl ?? fallback?.heroImage ?? "/images/beer-bg.jpg";
  const gallerySource = record.gallery.length > 0
    ? record.gallery
    : fallback?.gallery && fallback.gallery.length > 0
      ? fallback.gallery
      : [heroImage];

  const tastingNotes = record.tastingNotes.length > 0 ? record.tastingNotes : fallback?.tastingNotes ?? [];
  const pairings = record.pairings.length > 0 ? record.pairings : fallback?.pairings ?? [];

  return {
    id: record.id,
    slug: record.slug,
    name: record.name ?? fallback?.name ?? "Producto",
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
    variants: mapVariants(record.variants, fallback?.variants)
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const fallback = fallbackProducts.find((product) => product.slug === slug);

  try {
    const record = await prisma.product.findUnique({
      where: {slug},
      include: {variants: true}
    });

    if (!record) {
      return fallback ?? null;
    }

    return mapProductRecord(record, fallback);
  } catch (error) {
    console.error("Error loading product by slug", slug, error);
    return fallback ?? null;
  }
}
