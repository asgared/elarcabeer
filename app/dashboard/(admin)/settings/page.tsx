"use client";

import { useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
    Divider,
    SimpleGrid,
    Textarea,
    Switch,
    HStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FiSettings, FiGlobe, FiMail, FiPhone, FiShare2, FiSave } from "react-icons/fi";

type SettingsFormValues = {
    siteName: string;
    contactEmail: string;
    contactPhone: string;
    socialInstagram: string;
    socialFacebook: string;
    socialTwitter: string;
    maintenanceMode: boolean;
    allowGuestCheckout: boolean;
};

export default function SettingsPage() {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit } = useForm<SettingsFormValues>({
        defaultValues: {
            siteName: "El Arca Beer",
            contactEmail: "contacto@elarcabeer.com",
            maintenanceMode: false,
            allowGuestCheckout: true
        }
    });

    const onSubmit = async (values: SettingsFormValues) => {
        setIsSaving(true);
        // Nota: Esto simula el guardado de ajustes globales. 
        // En una fase posterior podríamos conectar esto a una tabla 'GlobalSettings' o al CMS.
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Configuración guardada",
            description: "Los cambios se han aplicado correctamente.",
            status: "success",
        });
        setIsSaving(false);
    };

    return (
        <Stack spacing={8} maxW="container.md">
            <Stack spacing={1}>
                <Heading size="lg" letterSpacing="tight">Configuración Global</Heading>
                <Text color="whiteAlpha.600">Administra los parámetros generales del sitio y redes sociales.</Text>
            </Stack>

            <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={10}>

                    {/* General */}
                    <Stack spacing={6}>
                        <HStack spacing={2} color="amber.500">
                            <FiGlobe />
                            <Text fontWeight="bold" textTransform="uppercase" fontSize="sm">Información General</Text>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl>
                                <FormLabel fontSize="sm">Nombre del Sitio</FormLabel>
                                <Input {...register("siteName")} />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Correo de Contacto</FormLabel>
                                <Input type="email" {...register("contactEmail")} />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Teléfono</FormLabel>
                                <Input {...register("contactPhone")} />
                            </FormControl>
                        </SimpleGrid>
                    </Stack>

                    <Divider borderColor="whiteAlpha.100" />

                    {/* Social */}
                    <Stack spacing={6}>
                        <HStack spacing={2} color="amber.500">
                            <FiShare2 />
                            <Text fontWeight="bold" textTransform="uppercase" fontSize="sm">Redes Sociales</Text>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl>
                                <FormLabel fontSize="sm">Instagram (@usuario)</FormLabel>
                                <Input {...register("socialInstagram")} placeholder="@elarcabeer" />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Facebook (URL)</FormLabel>
                                <Input {...register("socialFacebook")} />
                            </FormControl>
                        </SimpleGrid>
                    </Stack>

                    <Divider borderColor="whiteAlpha.100" />

                    {/* Tienda */}
                    <Stack spacing={6}>
                        <HStack spacing={2} color="amber.500">
                            <FiSettings />
                            <Text fontWeight="bold" textTransform="uppercase" fontSize="sm">Preferencias de Tienda</Text>
                        </HStack>
                        <Stack spacing={4}>
                            <FormControl display="flex" alignItems="center" justify="space-between">
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm">Modo Mantenimiento</Text>
                                    <Text fontSize="xs" color="whiteAlpha.500">Muestra una página de aviso y bloquea la navegación pública.</Text>
                                </Box>
                                <Switch {...register("maintenanceMode")} colorScheme="amber" />
                            </FormControl>

                            <FormControl display="flex" alignItems="center" justify="space-between">
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm">Checkout para Invitados</Text>
                                    <Text fontSize="xs" color="whiteAlpha.500">Permite realizar compras sin necesidad de crear una cuenta.</Text>
                                </Box>
                                <Switch {...register("allowGuestCheckout")} colorScheme="amber" />
                            </FormControl>
                        </Stack>
                    </Stack>

                    <Box pt={4}>
                        <Button
                            leftIcon={<FiSave />}
                            colorScheme="amber"
                            size="lg"
                            w={{ base: "full", md: "auto" }}
                            type="submit"
                            isLoading={isSaving}
                        >
                            Guardar Configuración
                        </Button>
                    </Box>

                </Stack>
            </Box>
        </Stack>
    );
}
