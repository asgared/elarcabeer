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
    Switch,
    SimpleGrid,
    Textarea,
    Icon,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import {
    FiEdit2, FiPlus, FiTrash2, FiMapPin,
    FiClock, FiCoffee, FiMusic, FiHeart
} from "react-icons/fi";

type Store = {
    id: string;
    name: string;
    slug: string;
    address: string;
    latitude: number;
    longitude: number;
    petFriendly: boolean;
    kitchen: boolean;
    events: boolean;
    hours: string;
    menuUrl?: string | null;
    _count?: {
        upcomingEvents: number;
    };
};

type StoreFormValues = {
    name: string;
    slug: string;
    address: string;
    latitude: number;
    longitude: number;
    petFriendly: boolean;
    kitchen: boolean;
    events: boolean;
    hours: string;
    menuUrl: string;
};

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<StoreFormValues>({
        defaultValues: {
            petFriendly: false,
            kitchen: false,
            events: false,
        }
    });

    const fetchStores = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/dashboard/stores");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al cargar sucursales");
            setStores(data.stores || []);
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
        fetchStores();
    }, [fetchStores]);

    const handleOpenModal = (store: Store | null = null) => {
        setEditingStore(store);
        if (store) {
            setValue("name", store.name);
            setValue("slug", store.slug);
            setValue("address", store.address);
            setValue("latitude", store.latitude);
            setValue("longitude", store.longitude);
            setValue("petFriendly", store.petFriendly);
            setValue("kitchen", store.kitchen);
            setValue("events", store.events);
            setValue("hours", store.hours);
            setValue("menuUrl", store.menuUrl || "");
        } else {
            reset({
                name: "", slug: "", address: "",
                latitude: 0, longitude: 0,
                petFriendly: false, kitchen: false, events: false,
                hours: "", menuUrl: ""
            });
        }
        onOpen();
    };

    const onSubmit = async (values: StoreFormValues) => {
        try {
            const url = "/api/dashboard/stores";
            const method = editingStore ? "PUT" : "POST";
            const body = editingStore ? { ...values, id: editingStore.id } : values;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al guardar");

            toast({
                title: editingStore ? "Sucursal actualizada" : "Sucursal creada",
                status: "success",
            });

            fetchStores();
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
        if (!confirm(`¿Estás seguro de que quieres eliminar la sucursal "${name}"?`)) return;

        try {
            const response = await fetch(`/api/dashboard/stores?id=${id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al eliminar");

            toast({ title: "Sucursal eliminada", status: "success" });
            fetchStores();
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
            <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                <Stack spacing={1}>
                    <Heading size="lg" letterSpacing="tight">Gestión de Sucursales</Heading>
                    <Text color="whiteAlpha.600">Administra las ubicaciones físicas, horarios y servicios.</Text>
                </Stack>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="amber"
                    variant="solid"
                    onClick={() => handleOpenModal()}
                >
                    Nueva Sucursal
                </Button>
            </Flex>

            <Box bg="whiteAlpha.50" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
                {isLoading ? (
                    <Center py={20}>
                        <Spinner color="amber.500" />
                    </Center>
                ) : stores.length === 0 ? (
                    <Center py={20} flexDirection="column" gap={4}>
                        <FiMapPin size={40} opacity={0.2} />
                        <Text color="whiteAlpha.500">No hay sucursales registradas.</Text>
                    </Center>
                ) : (
                    <Table variant="simple">
                        <Thead bg="whiteAlpha.50">
                            <Tr>
                                <Th color="whiteAlpha.400">Nombre / Dirección</Th>
                                <Th color="whiteAlpha.400">Servicios</Th>
                                <Th color="whiteAlpha.400">Horarios</Th>
                                <Th color="whiteAlpha.400" textAlign="right">Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {stores.map((store) => (
                                <Tr key={store.id} _hover={{ bg: "whiteAlpha.50" }} transition="all 0.2s">
                                    <Td>
                                        <Stack spacing={1}>
                                            <Text fontWeight="bold" fontSize="md">{store.name}</Text>
                                            <HStack spacing={1} color="whiteAlpha.500" fontSize="xs">
                                                <FiMapPin />
                                                <Text noOfLines={1}>{store.address}</Text>
                                            </HStack>
                                        </Stack>
                                    </Td>
                                    <Td>
                                        <HStack spacing={2}>
                                            {store.petFriendly && <Icon as={FiHeart} color="pink.400" title="Pet Friendly" />}
                                            {store.kitchen && <Icon as={FiCoffee} color="orange.400" title="Cocina" />}
                                            {store.events && <Icon as={FiMusic} color="purple.400" title="Eventos" />}
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <HStack spacing={1} fontSize="sm">
                                            <FiClock opacity={0.6} />
                                            <Text>{store.hours}</Text>
                                        </HStack>
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack spacing={2} justify="flex-end">
                                            <IconButton
                                                aria-label="Editar"
                                                icon={<FiEdit2 />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => handleOpenModal(store)}
                                            />
                                            <IconButton
                                                aria-label="Eliminar"
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => handleDelete(store.id, store.name)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
                <ModalContent bg="background.800" borderColor="whiteAlpha.200" borderWidth="1px">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader>{editingStore ? "Editar Sucursal" : "Nueva Sucursal"}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={6}>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl isInvalid={!!errors.name} isRequired>
                                        <FormLabel>Nombre de la sucursal</FormLabel>
                                        <Input
                                            {...register("name", { required: "El nombre es obligatorio" })}
                                            placeholder="Ej. El Arca Coyoacán"
                                        />
                                        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.slug} isRequired>
                                        <FormLabel>Slug</FormLabel>
                                        <Input
                                            {...register("slug", {
                                                required: "El slug es obligatorio",
                                                pattern: { value: /^[a-z0-9-]+$/, message: "Slug inválido" }
                                            })}
                                            placeholder="el-arca-coyoacan"
                                        />
                                        <FormErrorMessage>{errors.slug?.message}</FormErrorMessage>
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl isInvalid={!!errors.address} isRequired>
                                    <FormLabel>Dirección Completa</FormLabel>
                                    <Input
                                        {...register("address", { required: "La dirección es obligatoria" })}
                                        placeholder="Calle, Número, Colonia, CP, Ciudad"
                                    />
                                    <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
                                </FormControl>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <FormControl>
                                        <FormLabel>Latitud</FormLabel>
                                        <Input
                                            type="number"
                                            step="any"
                                            {...register("latitude", { valueAsNumber: true })}
                                            placeholder="19.4326"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Longitud</FormLabel>
                                        <Input
                                            type="number"
                                            step="any"
                                            {...register("longitude", { valueAsNumber: true })}
                                            placeholder="-99.1332"
                                        />
                                    </FormControl>
                                </SimpleGrid>

                                <FormControl isInvalid={!!errors.hours} isRequired>
                                    <FormLabel>Horarios</FormLabel>
                                    <Textarea
                                        {...register("hours", { required: "Los horarios son obligatorios" })}
                                        placeholder="Ej. Lun-Dom: 12:00 - 22:00"
                                        rows={2}
                                    />
                                    <FormErrorMessage>{errors.hours?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Link del Menú (PDF o URL)</FormLabel>
                                    <Input
                                        {...register("menuUrl")}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </FormControl>

                                <Stack p={4} borderRadius="lg" bg="whiteAlpha.50" spacing={4}>
                                    <Text fontWeight="bold" fontSize="sm" color="amber.500" textTransform="uppercase">Servicios y Amenidades</Text>
                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                        <FormControl display="flex" alignItems="center">
                                            <FormLabel mb="0" fontSize="sm">Pet Friendly</FormLabel>
                                            <Controller
                                                control={control}
                                                name="petFriendly"
                                                render={({ field }) => (
                                                    <Switch isChecked={field.value} onChange={field.onChange} colorScheme="amber" />
                                                )}
                                            />
                                        </FormControl>

                                        <FormControl display="flex" alignItems="center">
                                            <FormLabel mb="0" fontSize="sm">Cocina completa</FormLabel>
                                            <Controller
                                                control={control}
                                                name="kitchen"
                                                render={({ field }) => (
                                                    <Switch isChecked={field.value} onChange={field.onChange} colorScheme="amber" />
                                                )}
                                            />
                                        </FormControl>

                                        <FormControl display="flex" alignItems="center">
                                            <FormLabel mb="0" fontSize="sm">Sede de eventos</FormLabel>
                                            <Controller
                                                control={control}
                                                name="events"
                                                render={({ field }) => (
                                                    <Switch isChecked={field.value} onChange={field.onChange} colorScheme="amber" />
                                                )}
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </Stack>
                            </Stack>
                        </ModalBody>

                        <ModalFooter gap={3}>
                            <Button onClick={onClose} variant="ghost">Cancelar</Button>
                            <Button
                                type="submit"
                                colorScheme="amber"
                                isLoading={isSubmitting}
                            >
                                {editingStore ? "Guardar cambios" : "Crear Sucursal"}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
