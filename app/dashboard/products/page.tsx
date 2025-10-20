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
import { Controller, useForm } from "react-hook-form";
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
  imageFile: FileList;
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
    },
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

  // --- INICIO DE LA LÓGICA CORREGIDA ---
  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const file = values.imageFile?.[0];
      if (!file) {
        throw new Error("Selecciona una imagen para el producto.");
      }

      // 1. Leemos las variables de entorno CORRECTAS para la subida sin firmar.
      //    No necesitamos la API_KEY aquí.
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("La configuración pública de Cloudinary no está disponible.");
      }

      // 2. Eliminamos la llamada a nuestra API de firma. Ya no es necesaria.
      //    Creamos el FormData para la subida directa a Cloudinary.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "products"); // Opcional: para organizar en Cloudinary

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadResult.secure_url) {
        throw new Error("No se pudo subir la imagen a Cloudinary.");
      }

      // 3. Preparamos los datos del producto para nuestra API.
      const productPayload = {
        name: values.name,
        slug: values.slug,
        sku: values.sku,
        description: values.description,
        price: Math.round(values.price * 100), // Convertimos a centavos
        stock: values.stock,
        style: values.style,
        rating: values.rating,
        limitedEdition: values.limited,
        imageUrl: uploadResult.secure_url,
      };

      // 4. Llamamos a nuestra API para crear el producto en la base de datos.
      const createResponse = await fetch("/api/dashboard/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const createPayload = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(createPayload.error || "No se pudo crear el producto.");
      }

      // Actualizamos el estado local para mostrar el nuevo producto inmediatamente.
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
  // --- FIN DE LA LÓGICA CORREGIDA ---

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