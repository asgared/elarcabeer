"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductType } from "@prisma/client";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
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
import { useToast } from "@/hooks/use-toast";

import type { Product } from "./product-columns";
import type { ProductFormValues } from "./product-form";

type ProductFormFieldsProps = {
  initialProduct: Product | null;
};

function ProductFormFieldsPresentation({
  initialProduct,
}: ProductFormFieldsProps) {
  const { control, handleSubmit, formState } =
    useFormContext<ProductFormValues>();
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
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

      router.replace("/dashboard/products");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el producto.";
      setServerError(message);
      toast({
        title: "Error al guardar",
        description: message,
        status: "error",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-2xl border border-white/10 bg-background/80 p-6 shadow-soft"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
        control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
        control={control}
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
          control={control}
          name="metadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder={`{
  "tastingNotes": []
}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder={`{
  "main": "https://..."
}`}
                  {...field}
                />
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
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting
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
          onClick={() => router.replace("/dashboard/products")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function ProductFormFields(props: ProductFormFieldsProps) {
  // Wrapper para aislar el hook del export default
  return <ProductFormFieldsPresentation {...props} />;
}
