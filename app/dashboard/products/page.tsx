"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import NextLink from "next/link";

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
        return isNaN(num) ? undefined : num;
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const {
    control,
    formState: { errors, isSubmitting },
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
    () => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }),
    []
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

  const handleCloseModal = () => {
    setFormError(null);
    reset();
    onClose();
  };

  // --- INICIO DE LA LÓGICA DE CREACIÓN DE PRODUCTOS ---
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
        galleryFiles.map((galleryFile) => uploadToCloudinary(galleryFile))
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
          if (!trimmedName) {
            return null;
          }

          return {
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
        headers: { "Content-Type": "application/json" },
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

      handleCloseModal();
    } catch (error) {
      console.error("Error creating product:", error);
      const message = error instanceof Error ? error.message : "No se pudo crear el producto.";
      setFormError(message);
      toast({ title: "Error", description: message, status: "error" });
    }
  });
  // --- FIN DE LA LÓGICA DE CREACIÓN DE PRODUCTOS ---

  return (
    <Box py={10} px={{ base: 4, md: 8 }}>
      <Flex align="center" justify="space-between" mb={8} wrap="wrap" gap={4}>
        <Box>
          <Heading size="lg">Gestión de productos</Heading>
          <Text mt={2} color="gray.600">
            Administra el catálogo: consulta los productos existentes y crea nuevos con su imagen principal.
          </Text>
        </Box>
        <Button colorScheme="teal" onClick={onOpen}>
          Añadir producto
        </Button>
      </Flex>

      <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
        {isLoadingProducts ? (
          <Center py={16} flexDirection="column" gap={4}>
            <Spinner size="lg" />
            <Text color="gray.600">Cargando productos...</Text>
          </Center>
        ) : productsError ? (
          <Box bg="red.50" color="red.700" p={6}>
            <Heading size="sm" mb={2}>
              No se pudieron cargar los productos
            </Heading>
            <Text>{productsError}</Text>
            <Button mt={4} size="sm" onClick={fetchProducts}>
              Reintentar
            </Button>
          </Box>
        ) : products.length === 0 ? (
          <Center py={16} flexDirection="column" gap={2}>
            <Text fontWeight="semibold">Aún no hay productos registrados.</Text>
            <Text color="gray.600">Crea tu primer producto usando el botón “Añadir producto”.</Text>
          </Center>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Imagen</Th>
                  <Th>Nombre</Th>
                  <Th>SKU</Th>
                  <Th>Precio</Th>
                  <Th>Stock</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr key={product.id}>
                    <Td>
                      {product.imageUrl ? (
                        <Image
                          alt={product.name}
                          borderRadius="md"
                          boxSize="60px"
                          objectFit="cover"
                          src={product.imageUrl}
                        />
                      ) : (
                        <Center
                          bg="gray.100"
                          borderRadius="md"
                          boxSize="60px"
                          color="gray.500"
                          fontSize="xs"
                          textAlign="center"
                          px={2}
                        >
                          Sin imagen
                        </Center>
                      )}
                    </Td>
                    <Td>
                      <Stack spacing={1}>
                        <Text fontWeight="semibold">{product.name}</Text>
                        {product.slug ? (
                          <Text color="gray.500" fontSize="sm">
                            /{product.slug}
                          </Text>
                        ) : null}
                      </Stack>
                    </Td>
                    <Td>
                      <Text>{product.sku ?? "—"}</Text>
                    </Td>
                    <Td>
                      <Text>
                        {typeof product.price === "number"
                          ? currencyFormatter.format(product.price / 100)
                          : "—"}
                      </Text>
                    </Td>
                    <Td>
                      <Text>{typeof product.stock === "number" ? product.stock : "—"}</Text>
                    </Td>
                    <Td>
                      {product.limited ? (
                        <Badge colorScheme="purple">Edición limitada</Badge>
                      ) : (
                        <Badge colorScheme="green">Activo</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear nuevo producto</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={onSubmit} noValidate>
            <ModalBody>
              <Stack spacing={5}>
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel htmlFor="name">Nombre</FormLabel>
                  <Input
                    id="name"
                    placeholder="Nombre del producto"
                    {...register("name", { required: "El nombre es obligatorio." })}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.slug} isRequired>
                  <FormLabel htmlFor="slug">Slug</FormLabel>
                  <Input
                    id="slug"
                    placeholder="slug-del-producto"
                    {...register("slug", { required: "El slug es obligatorio." })}
                  />
                  <FormErrorMessage>{errors.slug?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.categoryLabel} isRequired>
                  <FormLabel htmlFor="categoryLabel">Etiqueta de categoría</FormLabel>
                  <Input
                    id="categoryLabel"
                    placeholder="Ej. IPA, Lager, Stout"
                    {...register("categoryLabel", {
                      required: "La categoría es obligatoria.",
                    })}
                  />
                  <FormErrorMessage>{errors.categoryLabel?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.sku} isRequired>
                  <FormLabel htmlFor="sku">SKU</FormLabel>
                  <Input
                    id="sku"
                    placeholder="SKU único"
                    {...register("sku", { required: "El SKU es obligatorio." })}
                  />
                  <FormErrorMessage>{errors.sku?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description} isRequired>
                  <FormLabel htmlFor="description">Descripción</FormLabel>
                  <Textarea
                    id="description"
                    placeholder="Describe el producto"
                    rows={4}
                    {...register("description", { required: "La descripción es obligatoria." })}
                  />
                  <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="tastingNotes">Notas de cata</FormLabel>
                  <Textarea
                    id="tastingNotes"
                    placeholder="Cítrica, tropical, herbal"
                    rows={3}
                    {...register("tastingNotes")}
                  />
                  <FormHelperText>
                    Separa cada nota por comas o saltos de línea.
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="pairings">Maridaje sugerido</FormLabel>
                  <Textarea
                    id="pairings"
                    placeholder="Hamburguesas, tacos, postres"
                    rows={3}
                    {...register("pairings")}
                  />
                  <FormHelperText>
                    Separa cada opción por comas o saltos de línea.
                  </FormHelperText>
                </FormControl>

                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                  <FormControl isInvalid={!!errors.price} isRequired flex={1}>
                    <FormLabel htmlFor="price">Precio (centavos)</FormLabel>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step="1"
                      {...register("price", {
                        valueAsNumber: true,
                        required: "El precio es obligatorio.",
                        min: { value: 0, message: "El precio debe ser mayor o igual a 0." },
                      })}
                    />
                    <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.stock} isRequired flex={1}>
                    <FormLabel htmlFor="stock">Stock</FormLabel>
                    <Input
                      id="stock"
                      type="number"
                      min={0}
                      step="1"
                      {...register("stock", {
                        valueAsNumber: true,
                        required: "El stock es obligatorio.",
                        min: { value: 0, message: "El stock debe ser mayor o igual a 0." },
                      })}
                    />
                    <FormErrorMessage>{errors.stock?.message}</FormErrorMessage>
                  </FormControl>
                </Flex>

                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                  <FormControl flex={1}>
                    <FormLabel htmlFor="style">Estilo</FormLabel>
                    <Input id="style" placeholder="Estilo de la cerveza" {...register("style")} />
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel htmlFor="rating">Rating</FormLabel>
                    <Input
                      id="rating"
                      type="number"
                      min={0}
                      max={5}
                      step="0.1"
                      {...register("rating", {
                        valueAsNumber: true,
                        min: { value: 0, message: "El rating mínimo es 0." },
                        max: { value: 5, message: "El rating máximo es 5." },
                      })}
                    />
                    <FormErrorMessage>{errors.rating?.message}</FormErrorMessage>
                  </FormControl>
                </Flex>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="limited" mb="0">
                    ¿Es edición limitada?
                  </FormLabel>
                  <Controller
                    control={control}
                    name="limited"
                    render={({ field }) => (
                      <Switch
                        id="limited"
                        isChecked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    )}
                  />
                </FormControl>

                <FormControl isInvalid={!!errors.imageFile} isRequired>
                  <FormLabel htmlFor="imageFile">Imagen principal</FormLabel>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    {...register("imageFile", {
                      validate: (value) =>
                        (value && value.length > 0) || "La imagen principal es obligatoria.",
                    })}
                  />
                  <FormErrorMessage>{errors.imageFile?.message}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="galleryFiles">Galería de imágenes</FormLabel>
                  <Input
                    id="galleryFiles"
                    type="file"
                    accept="image/*"
                    multiple
                    {...register("galleryFiles")}
                  />
                  <FormHelperText>
                    Puedes subir varias imágenes adicionales para la galería.
                  </FormHelperText>
                </FormControl>

                <Box>
                  <Flex align="center" justify="space-between" mb={3}>
                    <Heading size="sm">Variantes</Heading>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() =>
                        appendVariant({ name: "", price: 0, packSize: 1, abv: 0, ibu: 0 })
                      }
                    >
                      Añadir variante
                    </Button>
                  </Flex>
                  <Stack spacing={4}>
                    {variantFields.length === 0 ? (
                      <Text color="gray.600" fontSize="sm">
                        Añade variantes para definir presentaciones y precios específicos.
                      </Text>
                    ) : (
                      variantFields.map((field, index) => {
                        const variantErrors = errors.variants?.[index];
                        return (
                          <Box key={field.id} borderWidth="1px" borderRadius="md" p={4}>
                            <Stack spacing={4}>
                              <Flex align="center" justify="space-between">
                                <Text fontWeight="semibold">Variante {index + 1}</Text>
                                <Button
                                  size="xs"
                                  type="button"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => removeVariant(index)}
                                >
                                  Eliminar
                                </Button>
                              </Flex>

                              <FormControl isInvalid={!!variantErrors?.name} isRequired>
                                <FormLabel htmlFor={`variant-${index}-name`}>Nombre</FormLabel>
                                <Input
                                  id={`variant-${index}-name`}
                                  placeholder="Ej. 4-pack"
                                  {...register(`variants.${index}.name`, {
                                    required: "El nombre es obligatorio.",
                                  })}
                                />
                                <FormErrorMessage>
                                  {variantErrors?.name?.message as string | undefined}
                                </FormErrorMessage>
                              </FormControl>

                              <FormControl isInvalid={!!variantErrors?.packSize} isRequired>
                                <FormLabel htmlFor={`variant-${index}-packSize`}>
                                  Tamaño del paquete
                                </FormLabel>
                                <Input
                                  id={`variant-${index}-packSize`}
                                  type="number"
                                  min={1}
                                  step={1}
                                  {...register(`variants.${index}.packSize`, {
                                    valueAsNumber: true,
                                    required: "El tamaño del paquete es obligatorio.",
                                    min: {
                                      value: 1,
                                      message: "Debe ser al menos 1.",
                                    },
                                  })}
                                />
                                <FormErrorMessage>
                                  {variantErrors?.packSize?.message as string | undefined}
                                </FormErrorMessage>
                              </FormControl>

                              <FormControl isInvalid={!!variantErrors?.price} isRequired>
                                <FormLabel htmlFor={`variant-${index}-price`}>
                                  Precio (centavos)
                                </FormLabel>
                                <Input
                                  id={`variant-${index}-price`}
                                  type="number"
                                  min={0}
                                  step="1"
                                  {...register(`variants.${index}.price`, {
                                    valueAsNumber: true,
                                    required: "El precio es obligatorio.",
                                    min: {
                                      value: 0,
                                      message: "El precio debe ser mayor o igual a 0.",
                                    },
                                  })}
                                />
                                <FormErrorMessage>
                                  {variantErrors?.price?.message as string | undefined}
                                </FormErrorMessage>
                              </FormControl>

                              <FormControl isInvalid={!!variantErrors?.abv} isRequired>
                                <FormLabel htmlFor={`variant-${index}-abv`}>
                                  ABV (%)
                                </FormLabel>
                                <Input
                                  id={`variant-${index}-abv`}
                                  type="number"
                                  min={0}
                                  step="0.1"
                                  {...register(`variants.${index}.abv`, {
                                    valueAsNumber: true,
                                    required: "El ABV es obligatorio.",
                                    min: {
                                      value: 0,
                                      message: "El ABV debe ser mayor o igual a 0.",
                                    },
                                  })}
                                />
                                <FormErrorMessage>
                                  {variantErrors?.abv?.message as string | undefined}
                                </FormErrorMessage>
                              </FormControl>

                              <FormControl isInvalid={!!variantErrors?.ibu} isRequired>
                                <FormLabel htmlFor={`variant-${index}-ibu`}>
                                  IBU
                                </FormLabel>
                                <Input
                                  id={`variant-${index}-ibu`}
                                  type="number"
                                  min={0}
                                  step="1"
                                  {...register(`variants.${index}.ibu`, {
                                    valueAsNumber: true,
                                    required: "El IBU es obligatorio.",
                                    min: {
                                      value: 0,
                                      message: "El IBU debe ser mayor o igual a 0.",
                                    },
                                  })}
                                />
                                <FormErrorMessage>
                                  {variantErrors?.ibu?.message as string | undefined}
                                </FormErrorMessage>
                              </FormControl>
                            </Stack>
                          </Box>
                        );
                      })
                    )}
                  </Stack>
                </Box>

                {formError && (
                  <Box bg="red.50" borderRadius="md" color="red.700" p={3}>
                    {formError}
                  </Box>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button onClick={handleCloseModal} variant="ghost">
                Cancelar
              </Button>
              <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
                Crear producto
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}