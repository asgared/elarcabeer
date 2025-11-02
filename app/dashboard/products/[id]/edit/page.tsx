"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Controller, useFieldArray, useForm} from "react-hook-form";

import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";

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

type JsonRecord = Record<string, unknown>;

type ApiVariant = {
  id?: string;
  sku?: string | null;
  name?: string | null;
  price?: number | null;
  stock?: number | null;
  attributes?: JsonRecord | null;
};

type ApiProduct = {
  id: string;
  name?: string | null;
  slug?: string | null;
  sku?: string | null;
  description?: string | null;
  price?: number | null;
  stock?: number | null;
  style?: string | null;
  rating?: number | null;
  limitedEdition?: boolean | null;
  limited?: boolean | null;
  categoryLabel?: string | null;
  metadata?: JsonRecord | null;
  images?: JsonRecord | null;
  variants?: ApiVariant[] | null;
};

const parseNumberValue = (
  value: unknown,
  transform: (num: number) => number = (num) => num,
) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? transform(numericValue) : 0;
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeVariant = (variant: ApiVariant): VariantFormValues => {
  const attributes = isRecord(variant.attributes) ? variant.attributes : {};

  const packSizeSource = attributes.unit_count ?? attributes.packSize;
  const abvSource = attributes.abv;
  const ibuSource = attributes.ibu;

  return {
    sku: variant.sku ? String(variant.sku) : "",
    name: variant.name ? String(variant.name) : "",
    price: parseNumberValue(variant.price, (num) => num / 100),
    packSize: parseNumberValue(packSizeSource),
    abv: parseNumberValue(abvSource),
    ibu: parseNumberValue(ibuSource),
  };
};

const parseMultiValueField = (value: string) =>
  value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const buildMetadataPayload = (
  values: Pick<CreateProductFormValues, "tastingNotes" | "pairings">,
  baseMetadata: JsonRecord,
): JsonRecord => ({
  ...baseMetadata,
  tasting_notes: parseMultiValueField(values.tastingNotes ?? ""),
  pairings: parseMultiValueField(values.pairings ?? ""),
});

const toNullableFiniteNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export default function EditProductPage({params}: {params: {id: string}}) {
  const productId = params.id;

  const router = useRouter();
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
      imageFile: null,
      categoryLabel: "",
      tastingNotes: "",
      pairings: "",
      galleryFiles: null,
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

  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [existingHeroImageUrl, setExistingHeroImageUrl] = useState<string>("");
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [existingMetadata, setExistingMetadata] = useState<JsonRecord>({});
  const [existingImages, setExistingImages] = useState<JsonRecord>({});

  const sanitizedExistingMetadata = useMemo(() => {
    const metadataCopy: JsonRecord = {...existingMetadata};
    delete metadataCopy.tastingNotes;
    delete metadataCopy.tasting_notes;
    delete metadataCopy.pairings;
    return metadataCopy;
  }, [existingMetadata]);

  const sanitizedExistingImages = useMemo(() => {
    const imagesCopy: JsonRecord = {...existingImages};
    delete imagesCopy.main;
    delete imagesCopy.imageUrl;
    delete imagesCopy.gallery;
    return imagesCopy;
  }, [existingImages]);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoadError("No se pudo determinar el identificador del producto.");
      setIsLoadingProduct(false);
      return;
    }

    try {
      setIsLoadingProduct(true);
      setLoadError(null);

      const response = await fetch(`/api/dashboard/products/${productId}`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la información del producto.");
      }

      const payload = await response.json();
      const product: ApiProduct | undefined = payload?.product;

      if (!product) {
        throw new Error("La API no devolvió información del producto.");
      }

      const metadata = isRecord(product.metadata) ? {...product.metadata} : {};
      const images = isRecord(product.images) ? {...product.images} : {};

      const metadataWithCamel = metadata as JsonRecord & {
        tastingNotes?: unknown;
        pairings?: unknown;
      };

      const imagesWithCamel = images as JsonRecord & {
        main?: unknown;
        imageUrl?: unknown;
        gallery?: unknown;
      };

      const tastingNotesList = toStringArray(
        metadata["tasting_notes"] ?? metadataWithCamel.tastingNotes,
      );

      const pairingsList = toStringArray(
        metadata["pairings"] ?? metadataWithCamel.pairings,
      );

      const mainImageSource =
        imagesWithCamel.main ?? imagesWithCamel.imageUrl ?? images["main"] ?? "";
      const mainImage = typeof mainImageSource === "string" ? mainImageSource : "";

      const gallery = toStringArray(imagesWithCamel.gallery ?? images["gallery"]);

      setProductName(product.name ? String(product.name) : "");
      setExistingHeroImageUrl(mainImage);
      setExistingGalleryUrls(gallery);
      setExistingMetadata(metadata);
      setExistingImages(images);

      reset({
        name: product.name ? String(product.name) : "",
        slug: product.slug ? String(product.slug) : "",
        sku: product.sku ? String(product.sku) : "",
        description: product.description ? String(product.description) : "",
        price: parseNumberValue(product.price, (num) => num / 100),
        stock: parseNumberValue(product.stock),
        style: product.style ? String(product.style) : "",
        rating: parseNumberValue(product.rating),
        limited: Boolean(product.limitedEdition ?? product.limited ?? false),
        imageFile: null,
        categoryLabel: product.categoryLabel ? String(product.categoryLabel) : "",
        tastingNotes: tastingNotesList.join(", "),
        pairings: pairingsList.join(", "),
        galleryFiles: null,
        variants: Array.isArray(product.variants)
          ? product.variants
              .filter((variant): variant is ApiVariant => Boolean(variant))
              .map((variant) => normalizeVariant(variant))
          : [],
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al cargar el producto.";
      setLoadError(message);
    } finally {
      setIsLoadingProduct(false);
    }
  }, [productId, reset]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const onSubmit = handleSubmit(async (values) => {
    if (!productId) {
      setFormError("No se pudo determinar el identificador del producto.");
      return;
    }

    setFormError(null);

    try {
      const mainImageFile = values.imageFile?.[0] ?? null;
      const galleryFiles = values.galleryFiles ? Array.from(values.galleryFiles) : [];

      let heroImageUrl = existingHeroImageUrl;
      let galleryUrls = existingGalleryUrls;

      const shouldUploadHeroImage = Boolean(mainImageFile);
      const shouldUploadGallery = galleryFiles.length > 0;

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const uploadToCloudinary = async (file: File) => {
        if (!cloudName || !uploadPreset) {
          throw new Error("La configuración pública de Cloudinary no está disponible.");
        }

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

      if (shouldUploadHeroImage && mainImageFile) {
        heroImageUrl = await uploadToCloudinary(mainImageFile);
      }

      if (!heroImageUrl) {
        throw new Error("Selecciona o conserva una imagen principal para el producto.");
      }

      if (shouldUploadGallery) {
        const uploadedGallery = await Promise.all(galleryFiles.map(uploadToCloudinary));
        galleryUrls = [...existingGalleryUrls, ...uploadedGallery];
      }

      const ratingValue = Number.isFinite(values.rating) ? values.rating : 0;

      const productPriceValue = Number.isFinite(values.price) ? values.price : 0;
      const stockValue = Number.isFinite(values.stock) ? values.stock : 0;

      const metadataPayload = buildMetadataPayload(values, sanitizedExistingMetadata);

      const variantsPayload = (values.variants ?? [])
        .map((variant) => {
          const trimmedName = variant.name.trim();
          const trimmedSku = variant.sku.trim();
          if (!trimmedName || !trimmedSku) {
            return null;
          }

          const priceValue = Number.isFinite(variant.price) ? variant.price : 0;
          const priceInCents = Math.round(priceValue * 100);
          const packSizeValue = toNullableFiniteNumber(variant.packSize);
          const abvValue = toNullableFiniteNumber(variant.abv);
          const ibuValue = toNullableFiniteNumber(variant.ibu);

          return {
            sku: trimmedSku,
            name: trimmedName,
            price: priceInCents,
            stock: stockValue,
            attributes: {
              abv: abvValue,
              ibu: ibuValue,
              unit_count: packSizeValue,
            },
          };
        })
        .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));

      const imagesPayload: JsonRecord = {
        ...sanitizedExistingImages,
        main: heroImageUrl,
        gallery: galleryUrls,
      };

      const productPayload = {
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        description: values.description,
        price: Math.round(productPriceValue * 100),
        stock: stockValue,
        style: values.style,
        rating: ratingValue,
        limitedEdition: values.limited,
        categoryLabel: values.categoryLabel,
        metadata: metadataPayload,
        images: imagesPayload,
        variants: variantsPayload,
      };

      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(productPayload),
      });

      const payload = await response.json();
      if (!response.ok) {
        const apiError =
          typeof payload?.error === "string"
            ? payload.error
            : payload?.error?.message ?? "No se pudo actualizar el producto.";
        throw new Error(apiError);
      }

      setExistingHeroImageUrl(heroImageUrl);
      setExistingGalleryUrls(galleryUrls);
      setExistingMetadata(metadataPayload);
      setExistingImages(imagesPayload);

      toast({
        title: "Producto actualizado",
        description: `${payload.product?.name ?? values.name} se actualizó correctamente.`,
        status: "success",
      });

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      const message = error instanceof Error ? error.message : "No se pudo actualizar el producto.";
      setFormError(message);
      toast({title: "Error", description: message, status: "error"});
    }
  });

  return (
    <div className="px-4 py-10 md:px-8">
      <AdminPageHeader
        description={
          productName
            ? `Actualiza la información de «${productName}».`
            : "Actualiza la información del producto seleccionado."
        }
        title="Editar Producto"
      >
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Volver</Link>
        </Button>
      </AdminPageHeader>

      <div className="mt-8 rounded-2xl border border-white/10 bg-background/60 p-6">
        {isLoadingProduct ? (
          <div className="flex flex-col items-center gap-3 py-16 text-white/70">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            <p>Cargando información del producto...</p>
          </div>
        ) : loadError ? (
          <div className="space-y-3 bg-red-500/10 p-6 text-sm text-red-200">
            <h2 className="text-lg font-semibold text-red-100">No se pudo cargar el producto</h2>
            <p>{loadError}</p>
            <Button onClick={fetchProduct} size="sm" variant="outline">
              Reintentar
            </Button>
          </div>
        ) : (
          <form className="space-y-5" noValidate onSubmit={onSubmit}>
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
                <Label htmlFor="categoryLabel">Categoría</Label>
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
                    Producto de edición limitada
                  </label>
                )}
              />

              <div className="grid gap-2">
                <Label htmlFor="imageFile">Imagen principal</Label>
                <Input id="imageFile" type="file" accept="image/*" {...register("imageFile")} />
                {existingHeroImageUrl ? (
                  <p className="text-xs text-white/60">Imagen actual: {existingHeroImageUrl}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="galleryFiles">Galería</Label>
                <Input id="galleryFiles" type="file" accept="image/*" multiple {...register("galleryFiles")} />
                {existingGalleryUrls.length > 0 ? (
                  <div className="text-xs text-white/60">
                    <p className="font-medium text-white/70">Galería actual:</p>
                    <ul className="list-inside list-disc space-y-1">
                      {existingGalleryUrls.map((url) => (
                        <li key={url}>{url}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Variantes</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendVariant({
                        name: "",
                        sku: "",
                        price: 0,
                        packSize: 0,
                        abv: 0,
                        ibu: 0,
                      })
                    }
                  >
                    Añadir variante
                  </Button>
                </div>

                {variantFields.length === 0 ? (
                  <p className="text-sm text-white/60">Todavía no hay variantes registradas.</p>
                ) : (
                  <div className="space-y-6">
                    {variantFields.map((field, index) => {
                      const variantErrors = errors.variants?.[index];

                      return (
                        <div key={field.id} className="rounded-xl border border-white/10 p-4">
                          <div className="flex items-center justify-between pb-4">
                            <h4 className="font-medium text-white/80">Variante #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
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
                    })}
                  </div>
                )}
              </div>

              {formError ? (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {formError}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/products")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando producto..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
