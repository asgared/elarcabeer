import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

// Esquema de validación con Zod para la creación de productos
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
    
    const { limitedEdition, ...data } = validation.data;

    const product = await prisma.product.create({
      data: {
        ...data,
        limited: limitedEdition,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const message = error instanceof Error ? error.message : "Error desconocido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}