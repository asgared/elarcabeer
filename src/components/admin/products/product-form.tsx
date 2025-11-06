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

const variantSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1, "El nombre de la variante es requerido."),
  sku: z.string().min(1, "El SKU de la variante es requerido."),
  price: intField("precio"),
  stock: intField("stock"),
});

const stringArrayField = z
  .array(z.string().min(1, "El valor no puede estar vacío.").trim())
  .transform((values) =>
    values
      .map((value) => value.trim())
      .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index),
  );

const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  slug: z.string().min(1, "El slug es requerido."),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType, { required_error: "El tipo es requerido." }),
  style: z.string().optional(),
  rating: ratingField,
  limitedEdition: z.boolean().default(false),
  categoryLabel: z.string().optional(),
  tastingNotes: stringArrayField.default([]),
  suggestedPairings: stringArrayField.default([]),
  variants: z
    .array(variantSchema)
    .min(1, "Agrega al menos una presentación para el producto."),
  images: z
    .array(
      z
        .string({ invalid_type_error: "La URL de la imagen debe ser un texto." })
        .url("Ingresa una URL válida para la imagen."),
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }

  return [];
}

function extractStructuredArray(
  explicitValues: unknown,
  metadata: unknown,
  metadataKeys: string[],
): string[] {
  const explicitArray = toStringArray(explicitValues);

  if (explicitArray.length > 0) {
    return explicitArray;
  }

  const metadataRecord = asRecord(metadata);

  if (metadataRecord) {
    for (const key of metadataKeys) {
      if (key in metadataRecord) {
        const metadataValue = metadataRecord[key];
        const extracted = toStringArray(metadataValue);
        if (extracted.length > 0) {
          return extracted;
        }
      }
    }
  }

  return [];
}

function extractVariants(variants: Product["variants"] | undefined | null) {
  if (Array.isArray(variants) && variants.length > 0) {
    return variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
    }));
  }

  return [
    {
      id: undefined,
      name: "",
      sku: "",
      price: 0,
      stock: 0,
    },
  ];
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
    style: initialProduct?.style ?? "",
    rating: initialProduct?.rating ?? null,
    limitedEdition: initialProduct?.limitedEdition ?? false,
    categoryLabel: initialProduct?.categoryLabel ?? "",
    tastingNotes: extractStructuredArray(
      initialProduct?.tastingNotes,
      initialProduct?.metadata,
      ["tastingNotes", "tasting_notes"],
    ),
    suggestedPairings: extractStructuredArray(
      initialProduct?.suggestedPairings,
      initialProduct?.metadata,
      ["suggestedPairings", "pairings", "suggested_pairings"],
    ),
    variants: extractVariants(initialProduct?.variants),
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
