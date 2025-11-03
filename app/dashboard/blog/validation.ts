import {z} from "zod";

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido (solo minúsculas y guiones)",
    ),
  title: z.string().min(1, "El título es requerido"),
  excerpt: z.string().min(1, "El extracto es requerido"),
  body: z.string().min(1, "El cuerpo del post es requerido"),
  tags: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida"),
  published: z.string().min(1, "La fecha de publicación es requerida"),
  // Usamos string para el input date
});

export type BlogPostSchema = z.infer<typeof blogPostSchema>;
