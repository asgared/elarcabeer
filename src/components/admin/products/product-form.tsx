"use client"; // CRÍTICO: Debe ser un componente de cliente para usar RHF y shadcn/ui

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductType } from "@prisma/client";

import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

export function ProductForm({ initialProduct = null }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

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

  const isNew = !initialProduct;

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    const payload = {
      ...values,
      description: values.description?.trim() ? values.description : null,
      style: values.style?.trim() ? values.style : null,
      categoryLabel: values.categoryLabel?.trim() ? values.categoryLabel : null,
      rating: typeof values.rating === "number" ? values.rating : null,
      metadata: values.metadata?.trim() ? values.metadata : undefined,
      images: values.images?.trim() ? values.images : undefined,
    };

    try {
      const endpoint = isNew
        ? "/api/dashboard/products"
        : `/api/dashboard/products/${initialProduct?.id}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          typeof data?.error === "string"
            ? data.error
            : "No se pudo guardar el producto.";
        throw new Error(message);
      }

      toast({
        title: isNew ? "Producto creado" : "Producto actualizado",
        status: "success",
      });

      router.replace("/dashboard/(admin)/products");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el producto.";
      setServerError(message);
      toast({
        title: "Error al guardar",
        description: message,
        status: "error",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-2xl border border-white/10 bg-background/80 p-6 shadow-soft"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="IPA Artesanal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="ipa-artesanal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de producto</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ProductType.BEER}>Cerveza</SelectItem>
                    <SelectItem value={ProductType.FOOD}>Alimento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (centavos)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Descripción del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estilo</FormLabel>
                <FormControl>
                  <Input placeholder="IPA, Lager, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <Input placeholder="Cervezas artesanales" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calificación</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="limitedEdition"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-white/10 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base">Edición limitada</FormLabel>
                <p className="text-sm text-white/60">
                  Marca esta casilla si el producto corresponde a una edición especial.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="metadata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metadata (JSON)</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="{\n  \"tastingNotes\": []\n}" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imágenes (JSON)</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="{\n  \"main\": \"https://...\"\n}" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError ? (
          <div className="rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger">
            {serverError}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 md:flex-row">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? isNew
                ? "Creando..."
                : "Actualizando..."
              : isNew
              ? "Crear producto"
              : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace("/dashboard/(admin)/products")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
