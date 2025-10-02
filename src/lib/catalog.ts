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
      abv: variant.abv,
      ibu: variant.ibu,
      packSize: variant.packSize,
      price: variant.price
    }));
  }

  return fallback ?? [];
}

function mapProductRecord(record: PrismaProductWithVariants, fallback?: Product): Product {
  const heroImage = record.heroImage ?? fallback?.heroImage ?? "/images/beer-bg.jpg";
  const gallery = fallback?.gallery && fallback.gallery.length > 0 ? fallback.gallery : [heroImage];

  return {
    id: record.id,
    slug: record.slug,
    name: record.name ?? fallback?.name ?? "Producto",
    category: fallback?.category ?? "Catálogo",
    style: record.style ?? fallback?.style ?? "",
    description: record.description ?? fallback?.description ?? "",
    tastingNotes: fallback?.tastingNotes ?? [],
    pairings: fallback?.pairings ?? [],
    ingredients: fallback?.ingredients ?? [],
    rating: typeof record.rating === "number" ? record.rating : fallback?.rating ?? 0,
    limitedEdition: record.limited ?? fallback?.limitedEdition ?? false,
    heroImage,
    gallery,
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
