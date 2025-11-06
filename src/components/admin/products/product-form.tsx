"use client";

// CRÍTICO: Debe ser un componente de cliente para usar RHF y shadcn/ui

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
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
  metadata: z.string().optional(),
  images: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

function stringifyJson(value: unknown) {
  if (typeof value === "undefined" || value === null) {
    return "";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return "";
  }
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
    metadata: stringifyJson(initialProduct?.metadata),
    images: stringifyJson(initialProduct?.images),
  }), [initialProduct]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <FormProvider {...form}>
      <ProductFormFields initialProduct={initialProduct} />
    </FormProvider>
  );
}

export { ProductForm };
