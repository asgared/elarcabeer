import {z} from "zod";

export const socialLinkSchema = z.object({
  platform: z.string().min(2, "Ingresa el nombre de la red social."),
  url: z.string().url("Ingresa una URL válida."),
});

export const cmsContentSchema = z.object({
  slug: z.string().min(2, "El slug es obligatorio."),
  title: z.string().min(2, "El título es obligatorio."),
  subtitle: z.string().min(2).max(160).optional().or(z.literal("")),
  body: z.string().min(2).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z.array(socialLinkSchema).optional(),
});

export type CmsContentInput = z.infer<typeof cmsContentSchema>;
