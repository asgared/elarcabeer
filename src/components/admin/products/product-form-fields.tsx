"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductType } from "@prisma/client";
import { useFieldArray, useFormContext } from "react-hook-form";
import { X } from "lucide-react";

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
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

import type { Product } from "./product-columns";
import type { ProductFormValues } from "./product-form";

type ProductFormFieldsProps = {
  initialProduct: Product | null;
};

type ProductImagesFieldProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  toast: ReturnType<typeof useToast>;
  disabled?: boolean;
  onBlur?: () => void;
};

function ProductImagesField({ value, onChange, toast, disabled, onBlur }: ProductImagesFieldProps) {
  const { upload, isUploading } = useCloudinaryUpload({ folder: "products" });
  const isDisabled = disabled || isUploading;

  const handleRemove = (index: number) => {
    const nextValue = value.filter((_, currentIndex) => currentIndex !== index);
    onChange(nextValue);
    onBlur?.();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (files.length === 0) {
      return;
    }

    try {
      const uploads = await upload(files);
      const uploadedUrls = uploads.map((item) => item.url);
      onChange([...value, ...uploadedUrls]);
      onBlur?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron subir las imágenes. Inténtalo nuevamente.";

      toast({
        title: "Error al subir", 
        description: message,
        status: "error",
      });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.length === 0 ? (
          <p className="text-sm text-white/60">
            Aún no hay imágenes cargadas. Agrega al menos una para destacar el producto.
          </p>
        ) : null}
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative h-32 w-32 overflow-hidden rounded-xl border border-white/10"
          >
            <Image
              src={url}
              alt={`Imagen ${index + 1} del producto`}
              fill
              className="object-cover"
              sizes="128px"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Eliminar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <label
        className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-center text-sm text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
      >
        <span className="font-medium">
          {isUploading ? "Subiendo imágenes..." : "Haz clic o arrastra archivos"}
        </span>
        <span className="text-xs text-white/60">Formatos admitidos: JPG, PNG, WebP.</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          disabled={isDisabled}
        />
      </label>
    </div>
  );
}

function ProductFormFieldsPresentation({
  initialProduct,
}: ProductFormFieldsProps) {
  const { control, handleSubmit, formState } =
    useFormContext<ProductFormValues>();
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });
  const variantsError =
    (formState.errors.variants as { message?: string } | undefined)?.message ??
    (formState.errors.variants as { root?: { message?: string } } | undefined)?.root?.message;
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const isNew = !initialProduct;

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    const imageUrls = (values.images ?? [])
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const imagesPayload = imageUrls.length
      ? { main: imageUrls[0], gallery: imageUrls.slice(1) }
      : undefined;

    const normalizedVariants = values.variants.map((variant) => ({
      id: variant.id?.trim() ? variant.id.trim() : undefined,
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      price: variant.price,
      stock: variant.stock,
    }));

    const tastingNotes = values.tastingNotes ?? [];
    const suggestedPairings = values.suggestedPairings ?? [];

    const payload = {
      ...values,
      description: values.description?.trim() ? values.description : null,
      style: values.style?.trim() ? values.style : null,
      categoryLabel: values.categoryLabel?.trim() ? values.categoryLabel : null,
      rating: typeof values.rating === "number" ? values.rating : null,
      images: imagesPayload,
      variants: normalizedVariants,
      tastingNotes,
      suggestedPairings,
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
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes del producto</FormLabel>
              <FormControl>
                <ProductImagesField
                  value={Array.isArray(field.value) ? field.value : []}
                  onChange={field.onChange}
                  toast={toast}
                  disabled={field.disabled}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Presentaciones</h3>
            <p className="text-sm text-white/70">
              Configura las variantes del producto con su SKU, precio y stock.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendVariant({ id: undefined, name: "", sku: "", price: 0, stock: 0 })
            }
          >
            Añadir presentación
          </Button>
        </div>

        <div className="space-y-4">
          {variantFields.map((variant, index) => (
            <div
              key={variant.id}
              className="space-y-5 rounded-2xl border border-white/10 bg-background/60 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Presentación {index + 1}
                  </h4>
                  <p className="text-sm text-white/60">
                    Define los datos principales de esta presentación.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(index)}
                  disabled={variantFields.length === 1}
                  className="text-white/70 hover:text-white"
                  aria-label="Eliminar presentación"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={control}
                name={`variants.${index}.id`}
                render={({ field }) => <input type="hidden" {...field} />}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={control}
                  name={`variants.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la presentación</FormLabel>
                      <FormControl>
                        <Input placeholder="Lata 355ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`variants.${index}.sku`}
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={control}
                  name={`variants.${index}.price`}
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
                  name={`variants.${index}.stock`}
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
            </div>
          ))}
        </div>

        {variantsError ? (
          <p className="text-sm text-danger">{variantsError}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="tastingNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de cata</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Ingresa una nota por línea"
                  value={(field.value ?? []).join("\n")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(/\r?\n/)
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0),
                    )
                  }
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="suggestedPairings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maridajes sugeridos</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Ingresa un maridaje por línea"
                  value={(field.value ?? []).join("\n")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(/\r?\n/)
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0),
                    )
                  }
                  onBlur={field.onBlur}
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
