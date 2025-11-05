import { z } from "zod";

import { ProductType } from "@prisma/client";

const jsonLikeSchema = z.union([z.string(), z.record(z.any())]);

export const productInputSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  slug: z.string().min(1, "El slug es requerido."),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(ProductType).default(ProductType.BEER),
  price: z
    .number({ invalid_type_error: "El precio debe ser un número." })
    .int("El precio debe ser un número entero.")
    .min(0, "El precio no puede ser negativo."),
  stock: z
    .number({ invalid_type_error: "El stock debe ser un número." })
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser negativo."),
  sku: z.string().min(1, "El SKU es requerido."),
  style: z.string().optional().nullable(),
  rating: z
    .number({ invalid_type_error: "La calificación debe ser un número." })
    .min(0, "La calificación debe estar entre 0 y 5.")
    .max(5, "La calificación debe estar entre 0 y 5.")
    .optional()
    .nullable(),
  limitedEdition: z.boolean().optional(),
  categoryLabel: z.string().optional().nullable(),
  metadata: jsonLikeSchema.optional(),
  images: jsonLikeSchema.optional(),
});

export type ProductInputSchema = z.infer<typeof productInputSchema>;
