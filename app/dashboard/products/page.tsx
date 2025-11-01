"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {FiEdit, FiMoreVertical, FiTrash} from "react-icons/fi";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {DropdownMenu} from "@/components/ui/dropdown-menu";

import NextImage from "next/image";

type RawProduct = Record<string, unknown> & {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  style?: string;
  rating?: number | string;
  limited?: boolean;
  limitedEdition?: boolean;
  imageUrl?: string;
  heroImage?: string;
};

type AdminProduct = {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  style?: string;
  rating?: number;
  limited?: boolean;
  imageUrl?: string;
  categoryLabel?: string;
  tastingNotes?: string[];
  pairings?: string[];
  gallery?: string[];
};

type VariantFormValues = {
  sku: string;
  name: string;
  price: number;
  packSize: number;
  abv: number;
  ibu: number;
};

type CreateProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  style: string;
  rating: number;
  limited: boolean;
  imageFile: FileList | null | undefined;
  categoryLabel: string;
  tastingNotes: string;
  pairings: string;
  galleryFiles: FileList | null | undefined;
  variants: VariantFormValues[];
};

const normalizeProduct = (product: RawProduct): AdminProduct => {
  const coerceNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === "") return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  };

  const id = product.id ?? product.sku ?? product.slug ?? crypto.randomUUID();

  return {
    id: String(id),
    name: String(product.name ?? "Producto sin nombre"),
    slug: String(product.slug ?? ""),
    sku: String(product.sku ?? ""),
    description: String(product.description ?? ""),
    price: coerceNumber(product.price),
    stock: coerceNumber(product.stock),
    style: String(product.style ?? ""),
    rating: coerceNumber(product.rating),
    limited: Boolean(product.limited ?? product.limitedEdition),
    imageUrl: String(product.imageUrl ?? product.heroImage ?? ""),
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const toast = useToast();

  const {
    control,
    formState: {errors, isSubmitting},
    handleSubmit,
    register,
    reset,
  } = useForm<CreateProductFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: 0,
      stock: 0,
      style: "",
      rating: 0,
      limited: false,
      categoryLabel: "",
      tastingNotes: "",
      pairings: "",
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("es-MX", {style: "currency", currency: "MXN"}),
    [],
  );

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      const response = await fetch("/api/dashboard/products");
      if (!response.ok) throw new Error("No se pudieron cargar los productos.");
      const data = await response.json();
      setProducts((data.products || []).map(normalizeProduct));
    } catch (error) {
      console.error("Error loading products:", error);
      setProductsError(error instanceof Error ? error.message : "Error desconocido.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!isDialogOpen) {
      setFormError(null);
      reset();
    }
  }, [isDialogOpen, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const mainImageFile = values.imageFile?.[0];
      if (!mainImageFile) {
        throw new Error("Selecciona una imagen para el producto.");
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("La configuración pública de Cloudinary no está disponible.");
      }

      const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "products");

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!response.ok || !result.secure_url) {
          throw new Error("No se pudo subir la imagen a Cloudinary.");
        }

        return result.secure_url as string;
      };

      const heroImageUrl = await uploadToCloudinary(mainImageFile);

      const galleryFiles = values.galleryFiles ? Array.from(values.galleryFiles) : [];
      const galleryUrls = await Promise.all(
        galleryFiles.map((galleryFile) => uploadToCloudinary(galleryFile)),
      );

      const parseMultiValueField = (value: string) =>
        value
          .split(/,|\n/)
          .map((item) => item.trim())
          .filter(Boolean);

      const tastingNotes = parseMultiValueField(values.tastingNotes);
      const pairings = parseMultiValueField(values.pairings);

      const variantsPayload = (values.variants ?? [])
        .map((variant) => {
          const trimmedName = variant.name.trim();
          const trimmedSku = variant.sku.trim();
          if (!trimmedName || !trimmedSku) {
            return null;
          }

          return {
            sku: trimmedSku,
            name: trimmedName,
            price: Math.round(variant.price * 100),
            packSize: variant.packSize,
            abv: variant.abv,
            ibu: variant.ibu,
          };
        })
        .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));

      const ratingValue = Number.isFinite(values.rating) ? values.rating : 0;

      const productPayload = {
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        description: values.description,
        price: Math.round(values.price * 100),
        stock: values.stock,
        style: values.style,
        rating: ratingValue,
        limitedEdition: values.limited,
        imageUrl: heroImageUrl,
        categoryLabel: values.categoryLabel,
        tastingNotes,
        pairings,
        gallery: galleryUrls,
        variants: variantsPayload,
      };

      const createResponse = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(productPayload),
      });

      const createPayload = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createPayload.error || "No se pudo crear el producto.");
      }

      setProducts((prev) => [normalizeProduct(createPayload.product), ...prev]);

      toast({
        title: "Producto creado",
        description: `${createPayload.product.name} se añadió correctamente.`,
        status: "success",
      });

      setFormError(null);
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating product:", error);
      const message = error instanceof Error ? error.message : "No se pudo crear el producto.";
      setFormError(message);
      toast({title: "Error", description: message, status: "error"});
    }
  });

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        description="Administra el catálogo: consulta los productos existentes y crea nuevos con su imagen principal."
        title="Gestión de productos"
      >
        <Button onClick={() => setIsDialogOpen(true)}>Añadir producto</Button>
      </AdminPageHeader>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-background/60">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center gap-3 py-16 text-white/70">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            <p>Cargando productos...</p>
          </div>
        ) : productsError ? (
          <div className="space-y-3 bg-red-500/10 p-6 text-sm text-red-200">
            <h2 className="text-lg font-semibold text-red-100">No se pudieron cargar los productos</h2>
            <p>{productsError}</p>
            <Button onClick={fetchProducts} size="sm" variant="outline">
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-sm text-white/70">
            <p className="text-base font-semibold text-white">Aún no hay productos registrados.</p>
            <p>Crea tu primer producto usando el botón “Añadir producto”.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left uppercase tracking-wide text-white/70">
                <tr>
                  <th className="px-6 py-4 font-semibold">Imagen</th>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">SKU</th>
                  <th className="px-6 py-4 font-semibold">Precio</th>
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      {product.imageUrl ? (
                        <div className="relative h-14 w-14 overflow-hidden rounded-md border border-white/10">
                          <NextImage
                            alt={product.name}
                            className="object-cover"
                            fill
                            sizes="56px"
                            src={product.imageUrl}
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-white/10 text-[10px] text-white/60">
                          Sin imagen
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-white">{product.name}</span>
                        {product.slug ? (
                          <span className="text-xs text-white/60">/{product.slug}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{product.sku ?? "—"}</td>
                    <td className="px-6 py-4 text-white">
                      {typeof product.price === "number"
                        ? currencyFormatter.format(product.price / 100)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {typeof product.stock === "number" ? product.stock : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {product.limited ? (
                        <span className="inline-flex items-center rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-200">
                          Edición limitada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Button
                            aria-label={`Acciones para ${product.name}`}
                            size="icon"
                            variant="ghost"
                          >
                            <FiMoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            className="min-w-[160px] rounded-lg border border-white/10 bg-background/95 p-1 text-sm text-white shadow-lg backdrop-blur"
                            sideOffset={8}
                          >
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left transition-colors focus:outline-none data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
                            >
                              <FiEdit className="h-4 w-4" />
                              Editar
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-red-200 transition-colors focus:outline-none data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-100"
                            >
                              <FiTrash className="h-4 w-4" />
                              Eliminar
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <form className="space-y-5" noValidate onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Crear nuevo producto</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre del producto"
                  {...register("name", {required: "El nombre es obligatorio."})}
                />
                {errors.name ? <p className="text-sm text-red-400">{errors.name.message}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="slug-del-producto"
                  {...register("slug", {required: "El slug es obligatorio."})}
                />
                {errors.slug ? <p className="text-sm text-red-400">{errors.slug.message}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoryLabel">Etiqueta de categoría</Label>
                <Input
                  id="categoryLabel"
                  placeholder="Ej. IPA, Lager, Stout"
                  {...register("categoryLabel", {required: "La categoría es obligatoria."})}
                />
                {errors.categoryLabel ? (
                  <p className="text-sm text-red-400">{errors.categoryLabel.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="SKU único"
                  {...register("sku", {required: "El SKU es obligatorio."})}
                />
                {errors.sku ? <p className="text-sm text-red-400">{errors.sku.message}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el producto"
                  rows={4}
                  {...register("description", {required: "La descripción es obligatoria."})}
                />
                {errors.description ? (
                  <p className="text-sm text-red-400">{errors.description.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tastingNotes">Notas de cata</Label>
                <Textarea
                  id="tastingNotes"
                  placeholder="Cítrica, tropical, herbal"
                  rows={3}
                  {...register("tastingNotes")}
                />
                <p className="text-xs text-white/60">Separa cada nota por comas o saltos de línea.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pairings">Maridaje sugerido</Label>
                <Textarea
                  id="pairings"
                  placeholder="Hamburguesas, tacos, postres"
                  rows={3}
                  {...register("pairings")}
                />
                <p className="text-xs text-white/60">Separa cada opción por comas o saltos de línea.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio (centavos)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={1}
                    {...register("price", {
                      valueAsNumber: true,
                      required: "El precio es obligatorio.",
                      min: {value: 0, message: "El precio debe ser mayor o igual a 0."},
                    })}
                  />
                  {errors.price ? <p className="text-sm text-red-400">{errors.price.message}</p> : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    step={1}
                    {...register("stock", {
                      valueAsNumber: true,
                      required: "El stock es obligatorio.",
                      min: {value: 0, message: "El stock debe ser mayor o igual a 0."},
                    })}
                  />
                  {errors.stock ? <p className="text-sm text-red-400">{errors.stock.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="style">Estilo</Label>
                  <Input id="style" placeholder="IPA, Lager..." {...register("style")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={0}
                    max={5}
                    step="0.1"
                    {...register("rating", {
                      valueAsNumber: true,
                      min: {value: 0, message: "El rating mínimo es 0."},
                      max: {value: 5, message: "El rating máximo es 5."},
                    })}
                  />
                  {errors.rating ? <p className="text-sm text-red-400">{errors.rating.message}</p> : null}
                </div>
              </div>

              <Controller
                control={control}
                name="limited"
                render={({field}) => (
                  <label className="flex items-center gap-2 text-sm text-white">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(Boolean(value))}
                    />
                    ¿Es edición limitada?
                  </label>
                )}
              />

              <div className="grid gap-2">
                <Label htmlFor="imageFile">Imagen principal</Label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  className="text-sm text-white/80"
                  {...register("imageFile", {
                    validate: (value) => (value && value.length > 0) || "La imagen principal es obligatoria.",
                  })}
                />
                {errors.imageFile ? <p className="text-sm text-red-400">{errors.imageFile.message}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="galleryFiles">Galería de imágenes</Label>
                <input
                  id="galleryFiles"
                  type="file"
                  accept="image/*"
                  multiple
                  className="text-sm text-white/80"
                  {...register("galleryFiles")}
                />
                <p className="text-xs text-white/60">Puedes subir varias imágenes adicionales para la galería.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-background/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Variantes</h2>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendVariant({sku: "", name: "", price: 0, packSize: 1, abv: 0, ibu: 0})
                    }
                  >
                    Añadir variante
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  {variantFields.length === 0 ? (
                    <p className="text-sm text-white/60">Aún no has agregado variantes.</p>
                  ) : (
                    variantFields.map((variant, index) => {
                      const variantErrors = errors.variants?.[index];
                      return (
                        <div key={variant.id} className="rounded-lg border border-white/10 bg-background/60 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">Variante {index + 1}</span>
                            <Button
                              size="sm"
                              type="button"
                              variant="ghost"
                              onClick={() => removeVariant(index)}
                            >
                              Eliminar
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-${index}-name`}>Nombre</Label>
                              <Input
                                id={`variant-${index}-name`}
                                placeholder="Ej. 4-pack"
                                {...register(`variants.${index}.name`, {required: "El nombre es obligatorio."})}
                              />
                              {variantErrors?.name ? (
                                <p className="text-sm text-red-400">{variantErrors.name.message as string}</p>
                              ) : null}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-${index}-sku`}>SKU</Label>
                              <Input
                                id={`variant-${index}-sku`}
                                placeholder="SKU variante"
                                {...register(`variants.${index}.sku`, {required: "El SKU es obligatorio."})}
                              />
                              {variantErrors?.sku ? (
                                <p className="text-sm text-red-400">{variantErrors.sku.message as string}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-${index}-packSize`}>Tamaño del paquete</Label>
                              <Input
                                id={`variant-${index}-packSize`}
                                type="number"
                                min={1}
                                step={1}
                                {...register(`variants.${index}.packSize`, {
                                  valueAsNumber: true,
                                  required: "El tamaño del paquete es obligatorio.",
                                  min: {value: 1, message: "Debe ser al menos 1."},
                                })}
                              />
                              {variantErrors?.packSize ? (
                                <p className="text-sm text-red-400">{variantErrors.packSize.message as string}</p>
                              ) : null}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-${index}-price`}>Precio (centavos)</Label>
                              <Input
                                id={`variant-${index}-price`}
                                type="number"
                                min={0}
                                step={1}
                                {...register(`variants.${index}.price`, {
                                  valueAsNumber: true,
                                  required: "El precio es obligatorio.",
                                  min: {value: 0, message: "El precio debe ser mayor o igual a 0."},
                                })}
                              />
                              {variantErrors?.price ? (
                                <p className="text-sm text-red-400">{variantErrors.price.message as string}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-${index}-abv`}>ABV (%)</Label>
                              <Input
                                id={`variant-${index}-abv`}
                                type="number"
                                min={0}
                                step={0.1}
                                {...register(`variants.${index}.abv`, {
                                  valueAsNumber: true,
                                  required: "El ABV es obligatorio.",
                                  min: {value: 0, message: "El ABV debe ser mayor o igual a 0."},
                                })}
                              />
                              {variantErrors?.abv ? (
                                <p className="text-sm text-red-400">{variantErrors.abv.message as string}</p>
                              ) : null}
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-${index}-ibu`}>IBU</Label>
                              <Input
                                id={`variant-${index}-ibu`}
                                type="number"
                                min={0}
                                step={1}
                                {...register(`variants.${index}.ibu`, {
                                  valueAsNumber: true,
                                  required: "El IBU es obligatorio.",
                                  min: {value: 0, message: "El IBU debe ser mayor o igual a 0."},
                                })}
                              />
                              {variantErrors?.ibu ? (
                                <p className="text-sm text-red-400">{variantErrors.ibu.message as string}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {formError ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {formError}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando producto..." : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
