import type {Prisma} from "@prisma/client";

import type {Product, Variant} from "@/types/catalog";
import {prisma} from "./prisma";

type PrismaProductWithVariants = Prisma.ProductGetPayload<{
  include: {variants: true};
}>;

function mapVariants(recordVariants: PrismaProductWithVariants["variants"]): Variant[] {
  return recordVariants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    abv: variant.abv,
    ibu: variant.ibu,
    packSize: variant.packSize,
    price: variant.price
  }));
}

function mapProductRecord(record: PrismaProductWithVariants): Product {
  const heroImage = record.imageUrl ?? record.heroImage ?? "/images/beer-bg.jpg";
  const gallery = [heroImage];

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: "Catálogo",
    style: record.style,
    description: record.description,
    tastingNotes: [],
    pairings: [],
    ingredients: [],
    rating: typeof record.rating === "number" ? record.rating : 0,
    limitedEdition: record.limited,
    heroImage,
    imageUrl: heroImage,
    gallery,
    variants: mapVariants(record.variants)
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const record = await prisma.product.findUnique({
      where: {slug},
      include: {variants: true}
    });

    if (!record) {
      return null;
    }

    return mapProductRecord(record);
  } catch (error) {
    console.error("Error loading product by slug", slug, error);
    return null;
  }
}

export async function listProducts(): Promise<Product[]> {
  try {
    const records = await prisma.product.findMany({
      include: {variants: true},
      orderBy: {name: "asc"}
    });

    return records.map(mapProductRecord);
  } catch (error) {
    console.error("Error listing products", error);
    return [];
  }
}
