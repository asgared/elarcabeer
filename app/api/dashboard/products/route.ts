import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

// Esquema de validación con Zod para la creación de productos
const variantSchema = z.object({
  sku: z.string().min(1, "El SKU de la variante es requerido."),
  name: z.string().min(1, "El nombre de la variante es requerido."),
  price: z.number().int().min(0, "El precio no puede ser negativo."),
  packSize: z.number().int().min(1, "El tamaño del paquete debe ser al menos 1."),
  abv: z.number().min(0, "El ABV no puede ser negativo."),
  ibu: z.number().int().min(0, "El IBU no puede ser negativo."),
});

const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  slug: z.string().min(1, "El slug es requerido."),
  sku: z.string().min(1, "El SKU es requerido."),
  description: z.string().optional(),
  price: z.number().int().min(0, "El precio no puede ser negativo."),
  stock: z.number().int().min(0, "El stock no puede ser negativo."),
  style: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  limitedEdition: z.boolean().default(false),
  imageUrl: z.string().url("La URL de la imagen no es válida."),
  categoryLabel: z.string().min(1, "La categoría es requerida."),
  tastingNotes: z.array(z.string().min(1)).default([]),
  pairings: z.array(z.string().min(1)).default([]),
  gallery: z.array(z.string().url("La URL de la imagen no es válida.")).default([]),
  variants: z.array(variantSchema).default([]),
});

// --- GET: Para obtener todos los productos ---
export async function GET() {
  try {
    await requireAdmin(); // Seguridad: solo admins pueden listar productos

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        variants: true, // Incluimos variantes si las tienes
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    const message = error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// --- POST: Para crear un nuevo producto ---
export async function POST(request: Request) {
  try {
    await requireAdmin(); // Seguridad: solo admins pueden crear productos

    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    
    const { limitedEdition, variants, ...data } = validation.data;

    const product = await prisma.product.create({
      data: {
        ...data,
        limitedEdition,
        variants:
          variants.length > 0
            ? {
                create: variants.map((variant) => ({
                  sku: variant.sku,
                  name: variant.name,
                  price: variant.price,
                  packSize: variant.packSize,
                  abv: variant.abv,
                  ibu: variant.ibu,
                })),
              }
            : undefined,
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const message = error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}