"use client";

// CRÍTICO: Debe ser un componente de cliente para usar RHF y shadcn/ui

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { ProductType } from "@prisma/client";

import ProductFormFields from "@/components/admin/products/product-form-fields";

import type { Product } from "./product-columns";

const intField = (fieldLabel: string) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return Number.NaN;
      }
      return Number(trimmed);
    }
    return value;
  }, z
    .number({ invalid_type_error: `El ${fieldLabel} es requerido.` })
    .int(`El ${fieldLabel} debe ser un número entero.`)
    .min(0, `El ${fieldLabel} no puede ser negativo.`));

const ratingField = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      return value;
    }

    return parsed;
  }

  return value;
},
z
  .number({ invalid_type_error: "La calificación debe ser un número." })
  .min(0, "La calificación debe estar entre 0 y 5.")
  .max(5, "La calificación debe estar entre 0 y 5.")
  .nullable()
  .optional());

const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  slug: z.string().min(1, "El slug es requerido."),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType, { required_error: "El tipo es requerido." }),
  price: intField("precio"),
  stock: intField("stock"),
  sku: z.string().min(1, "El SKU es requerido."),
  style: z.string().optional(),
  rating: ratingField,
  limitedEdition: z.boolean().default(false),
  categoryLabel: z.string().optional(),
  metadata: z
    .string({ invalid_type_error: "La nota de catálogo debe ser texto." })
    .max(500, "La nota del catálogo es demasiado larga.")
    .optional(),
  images: z
    .array(
      z
        .string({ invalid_type_error: "La URL de la imagen debe ser un texto." })
        .url("Ingresa una URL válida para la imagen."),
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

function extractCatalogNote(metadata: unknown): string {
  if (typeof metadata === "string") {
    const trimmed = metadata.trim();

    if (!trimmed) {
      return "";
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as Record<string, unknown>).catalogNote === "string"
      ) {
        return (parsed as { catalogNote: string }).catalogNote;
      }
    } catch (error) {
      return trimmed;
    }

    return "";
  }

  if (metadata && typeof metadata === "object") {
    const metadataRecord = metadata as Record<string, unknown>;
    if (typeof metadataRecord.catalogNote === "string") {
      return metadataRecord.catalogNote;
    }
  }

  return "";
}

function extractImageUrls(images: unknown): string[] {
  const urls: string[] = [];

  const appendIfUrl = (value: unknown) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        urls.push(trimmed);
      }
    }
  };

  if (!images) {
    return urls;
  }

  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) {
      return urls;
    }

    try {
      return extractImageUrls(JSON.parse(trimmed));
    } catch (error) {
      appendIfUrl(trimmed);
      return urls;
    }
  }

  if (Array.isArray(images)) {
    images.forEach(appendIfUrl);
    return urls;
  }

  if (typeof images === "object") {
    const record = images as Record<string, unknown>;
    appendIfUrl(record.main);

    const gallery = record.gallery;
    if (Array.isArray(gallery)) {
      gallery.forEach(appendIfUrl);
    } else {
      appendIfUrl(gallery);
    }

    return urls;
  }

  return urls;
}

type ProductFormProps = {
  initialProduct?: Product | null;
};

export default function ProductForm({ initialProduct = null }: ProductFormProps) {
  const defaultValues = useMemo<ProductFormValues>(() => ({
    name: initialProduct?.name ?? "",
    slug: initialProduct?.slug ?? "",
    description: initialProduct?.description ?? "",
    type: initialProduct?.type ?? ProductType.BEER,
    price: initialProduct?.price ?? 0,
    stock: initialProduct?.stock ?? 0,
    sku: initialProduct?.sku ?? "",
    style: initialProduct?.style ?? "",
    rating: initialProduct?.rating ?? null,
    limitedEdition: initialProduct?.limitedEdition ?? false,
    categoryLabel: initialProduct?.categoryLabel ?? "",
    metadata: extractCatalogNote(initialProduct?.metadata),
    images: extractImageUrls(initialProduct?.images),
  }), [initialProduct]);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  return (
    <FormProvider {...methods}>
      <ProductFormFields initialProduct={initialProduct} />
    </FormProvider>
  );
}

export { ProductForm };
