"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast
} from "@chakra-ui/react";
import {useEffect, useMemo, useState} from "react";
import {useForm} from "react-hook-form";

import {formatCurrency} from "@/utils/currency";

type FormValues = {
  name: string;
  description: string;
  price: number;
  image: FileList;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  price: number;
};

function mapProduct(record: any): AdminProduct {
  const price = record.variants?.[0]?.price ?? 0;

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    imageUrl: record.imageUrl ?? record.heroImage ?? null,
    price
  };
}

export default function DashboardProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: {isSubmitting}
  } = useForm<FormValues>({
    defaultValues: {name: "", description: "", price: 0}
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/admin/products", {cache: "no-store"});

        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos");
        }

        const data = (await response.json()) as {products: any[]};
        setProducts(data.products.map(mapProduct));
      } catch (error) {
        console.error(error);
        toast({
          title: "Error al cargar productos",
          description: error instanceof Error ? error.message : "Intenta nuevamente más tarde",
          status: "error"
        });
      }
    }

    void loadProducts();
  }, [toast]);

  const onSubmit = handleSubmit(async (values) => {
    if (!values.image || values.image.length === 0) {
      toast({title: "Selecciona una imagen", status: "warning"});
      return;
    }

    const file = values.image[0];

    try {
      const signatureResponse = await fetch("/api/admin/upload-signature", {method: "POST"});

      if (!signatureResponse.ok) {
        throw new Error("No se pudo obtener la firma de carga");
      }

      const signaturePayload = (await signatureResponse.json()) as {
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder?: string;
      };

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/auto/upload`;
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", signaturePayload.apiKey);
      uploadData.append("timestamp", String(signaturePayload.timestamp));
      uploadData.append("signature", signaturePayload.signature);

      if (signaturePayload.folder) {
        uploadData.append("folder", signaturePayload.folder);
      }

      const uploadResponse = await fetch(uploadUrl, {method: "POST", body: uploadData});

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen a Cloudinary");
      }

      const uploadResult = (await uploadResponse.json()) as {secure_url?: string};

      if (!uploadResult.secure_url) {
        throw new Error("Cloudinary no devolvió la URL de la imagen");
      }

      const productResponse = await fetch("/api/admin/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price: Math.round(values.price * 100),
          imageUrl: uploadResult.secure_url
        })
      });

      if (!productResponse.ok) {
        const payload = await productResponse.json().catch(() => null);
        const errorMessage = payload?.error ?? "No se pudo crear el producto";
        throw new Error(errorMessage);
      }

      const {product} = (await productResponse.json()) as {product: any};
      setProducts((current) => [mapProduct(product), ...current]);
      reset();
      toast({title: "Producto creado", status: "success"});
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el producto",
        status: "error"
      });
    }
  });

  const hasProducts = useMemo(() => products.length > 0, [products]);

  return (
    <VStack align="stretch" spacing={10} px={{base: 4, md: 8}} py={{base: 6, md: 10}}>
      <Heading size="lg">Gestión de productos</Heading>
      <Box as="form" bg="rgba(12,27,30,0.75)" borderRadius="xl" p={{base: 6, md: 8}} onSubmit={onSubmit}>
        <VStack align="stretch" spacing={5}>
          <FormControl isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input placeholder="Nombre del producto" {...register("name", {required: true})} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Descripción</FormLabel>
            <Input placeholder="Descripción breve" {...register("description", {required: true})} />
          </FormControl>
          <HStack spacing={6} align={{base: "stretch", md: "flex-end"}} flexWrap="wrap">
            <FormControl isRequired flex="1">
              <FormLabel>Precio (MXN)</FormLabel>
              <Input type="number" step="0.01" min="0" {...register("price", {valueAsNumber: true, min: 0})} />
            </FormControl>
            <FormControl isRequired flex="1">
              <FormLabel>Imagen</FormLabel>
              <Input type="file" accept="image/*" {...register("image", {required: true})} />
            </FormControl>
          </HStack>
          <Button alignSelf="flex-start" colorScheme="teal" isLoading={isSubmitting} type="submit">
            Crear producto
          </Button>
        </VStack>
      </Box>

      <Box bg="rgba(12,27,30,0.75)" borderRadius="xl" p={{base: 4, md: 6}}>
        <Heading size="md" mb={4}>
          Productos existentes
        </Heading>
        {hasProducts ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Imagen</Th>
                <Th>Nombre</Th>
                <Th>Precio</Th>
                <Th isNumeric>Acciones</Th>
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
                        h="60px"
                        objectFit="cover"
                        src={product.imageUrl}
                        w="60px"
                      />
                    ) : (
                      <Box h="60px" w="60px" bg="blackAlpha.300" borderRadius="md" />
                    )}
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{product.name}</Text>
                      <Text fontSize="sm" color="whiteAlpha.600">
                        {product.slug}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>{formatCurrency(product.price)}</Td>
                  <Td isNumeric>
                    <Flex justify="flex-end" gap={2}>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                      <Button size="sm" colorScheme="red" variant="outline">
                        Eliminar
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text color="whiteAlpha.700">Aún no hay productos registrados.</Text>
        )}
      </Box>
    </VStack>
  );
}

