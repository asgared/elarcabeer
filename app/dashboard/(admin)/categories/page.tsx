"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
    Badge,
    Spinner,
    Center,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiPlus, FiTrash2, FiTag } from "react-icons/fi";

type Category = {
    id: string;
    name: string;
    slug: string;
    _count?: {
        products: number;
    };
};

type CategoryFormValues = {
    name: string;
    slug: string;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormValues>();

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/dashboard/categories");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al cargar categorías");
            setCategories(data.categories || []);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error desconocido",
                status: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenModal = (category: Category | null = null) => {
        setEditingCategory(category);
        if (category) {
            setValue("name", category.name);
            setValue("slug", category.slug);
        } else {
            reset({ name: "", slug: "" });
        }
        onOpen();
    };

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            const url = "/api/dashboard/categories";
            const method = editingCategory ? "PUT" : "POST";
            const body = editingCategory ? { ...values, id: editingCategory.id } : values;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al guardar");

            toast({
                title: editingCategory ? "Categoría actualizada" : "Categoría creada",
                status: "success",
            });

            fetchCategories();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error desconocido",
                status: "error",
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"?`)) return;

        try {
            const response = await fetch(`/api/dashboard/categories?id=${id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al eliminar");

            toast({ title: "Categoría eliminada", status: "success" });
            fetchCategories();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error desconocido",
                status: "error",
            });
        }
    };

    return (
        <Stack spacing={8}>
            <Flex align="center" justify="space-between">
                <Stack spacing={1}>
                    <Heading size="lg" letterSpacing="tight">Gestión de Categorías</Heading>
                    <Text color="whiteAlpha.600">Administra las categorías de productos del catálogo.</Text>
                </Stack>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="amber"
                    variant="solid"
                    onClick={() => handleOpenModal()}
                >
                    Nueva Categoría
                </Button>
            </Flex>

            <Box bg="whiteAlpha.50" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
                {isLoading ? (
                    <Center py={20}>
                        <Spinner color="amber.500" />
                    </Center>
                ) : categories.length === 0 ? (
                    <Center py={20} flexDirection="column" gap={4}>
                        <FiTag size={40} opacity={0.2} />
                        <Text color="whiteAlpha.500">No hay categorías registradas.</Text>
                    </Center>
                ) : (
                    <Table variant="simple">
                        <Thead bg="whiteAlpha.50">
                            <Tr>
                                <Th color="whiteAlpha.400">Nombre</Th>
                                <Th color="whiteAlpha.400">Slug</Th>
                                <Th color="whiteAlpha.400" isNumeric>Productos</Th>
                                <Th color="whiteAlpha.400" textAlign="right">Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {categories.map((cat) => (
                                <Tr key={cat.id} _hover={{ bg: "whiteAlpha.50" }} transition="bg 0.2s">
                                    <Td fontWeight="medium">{cat.name}</Td>
                                    <Td>
                                        <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2}>
                                            {cat.slug}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        <Badge colorScheme="amber" variant="outline" borderRadius="full">
                                            {cat._count?.products || 0}
                                        </Badge>
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack spacing={2} justify="flex-end">
                                            <IconButton
                                                aria-label="Editar"
                                                icon={<FiEdit2 />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => handleOpenModal(cat)}
                                            />
                                            <IconButton
                                                aria-label="Eliminar"
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => handleDelete(cat.id, cat.name)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
                <ModalContent bg="background.800" borderColor="whiteAlpha.200" borderWidth="1px">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={4}>
                                <FormControl isInvalid={!!errors.name} isRequired>
                                    <FormLabel>Nombre</FormLabel>
                                    <Input
                                        {...register("name", { required: "El nombre es obligatorio" })}
                                        placeholder="Ej. Cervezas Artesanales"
                                    />
                                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!errors.slug} isRequired>
                                    <FormLabel>Slug</FormLabel>
                                    <Input
                                        {...register("slug", {
                                            required: "El slug es obligatorio",
                                            pattern: {
                                                value: /^[a-z0-9-]+$/,
                                                message: "El slug solo puede contener letras minúsculas, números y guiones"
                                            }
                                        })}
                                        placeholder="ej-cervezas-artesanales"
                                    />
                                    <FormErrorMessage>{errors.slug?.message}</FormErrorMessage>
                                </FormControl>
                            </Stack>
                        </ModalBody>

                        <ModalFooter gap={3}>
                            <Button onClick={onClose} variant="ghost">Cancelar</Button>
                            <Button
                                type="submit"
                                colorScheme="amber"
                                isLoading={isSubmitting}
                            >
                                {editingCategory ? "Actualizar" : "Crear"}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
