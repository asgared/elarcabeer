import {z} from "zod";

export const storeSchema = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido (solo minúsculas y guiones)"
    ),
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  hours: z.string().min(1, "El horario es requerido"),
  menuUrl: z
    .string()
    .url("URL no válida")
    .optional()
    .or(z.literal("")),
  latitude: z.coerce.number({invalid_type_error: "Debe ser un número"}),
  longitude: z.coerce.number({invalid_type_error: "Debe ser un número"}),
  petFriendly: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  events: z.boolean().default(false),
});

export type StoreSchema = z.infer<typeof storeSchema>;
