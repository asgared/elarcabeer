"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
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
    Avatar,
    Select,
    Divider,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FiUsers, FiStar, FiShoppingBag, FiEdit2, FiActivity } from "react-icons/fi";

type Customer = {
    id: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
    role: string;
    _count?: {
        orders: number;
        loyalty: number;
    };
    loyalty: Array<{
        id: string;
        points: number;
        reason: string;
        createdAt: string;
    }>;
};

type CustomerFormValues = {
    name: string;
    lastName: string;
    role: string;
};

type LoyaltyFormValues = {
    points: number;
    reason: string;
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const customerModal = useDisclosure();
    const loyaltyModal = useDisclosure();
    const toast = useToast();

    const customerForm = useForm<CustomerFormValues>();
    const loyaltyForm = useForm<LoyaltyFormValues>();

    const fetchCustomers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/dashboard/customers");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al cargar clientes");
            setCustomers(data.customers || []);
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
        fetchCustomers();
    }, [fetchCustomers]);

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        customerForm.setValue("name", customer.name || "");
        customerForm.setValue("lastName", customer.lastName || "");
        customerForm.setValue("role", customer.role);
        customerModal.onOpen();
    };

    const handleAdjustPoints = (customer: Customer) => {
        setSelectedCustomer(customer);
        loyaltyForm.reset({ points: 0, reason: "" });
        loyaltyModal.onOpen();
    };

    const onCustomerSubmit = async (values: CustomerFormValues) => {
        if (!selectedCustomer) return;
        try {
            const response = await fetch("/api/dashboard/customers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, id: selectedCustomer.id }),
            });

            if (!response.ok) throw new Error("Error al actualizar perfil");

            toast({ title: "Perfil actualizado", status: "success" });
            fetchCustomers();
            customerModal.onClose();
        } catch (error) {
            toast({ title: "Error", status: "error" });
        }
    };

    const onLoyaltySubmit = async (values: LoyaltyFormValues) => {
        if (!selectedCustomer) return;
        try {
            const response = await fetch("/api/dashboard/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, userId: selectedCustomer.id }),
            });

            if (!response.ok) throw new Error("Error al ajustar puntos");

            toast({ title: "Puntos ajustados correctamente", status: "success" });
            fetchCustomers();
            loyaltyModal.onClose();
        } catch (error) {
            toast({ title: "Error", status: "error" });
        }
    };

    const calculateTotalPoints = (loyaltyEntries: Customer["loyalty"]) => {
        // Nota: En una app real esto vendría acumulado de la DB para eficiencia, 
        // pero aquí lo calculamos basado en el ledger.
        return (loyaltyEntries || []).reduce((acc, entry) => acc + entry.points, 0);
    };

    return (
        <Stack spacing={8}>
            <Flex align="center" justify="space-between">
                <Stack spacing={1}>
                    <Heading size="lg" letterSpacing="tight">Gestión de Clientes</Heading>
                    <Text color="whiteAlpha.600">Base de datos de usuarios y programas de lealtad.</Text>
                </Stack>
            </Flex>

            <Box bg="whiteAlpha.50" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
                {isLoading ? (
                    <Center py={20}>
                        <Spinner color="amber.500" />
                    </Center>
                ) : customers.length === 0 ? (
                    <Center py={20} flexDirection="column" gap={4}>
                        <FiUsers size={40} opacity={0.2} />
                        <Text color="whiteAlpha.500">No hay clientes registrados.</Text>
                    </Center>
                ) : (
                    <Table variant="simple">
                        <Thead bg="whiteAlpha.50">
                            <Tr>
                                <Th color="whiteAlpha.400">Cliente</Th>
                                <Th color="whiteAlpha.400">Rol</Th>
                                <Th color="whiteAlpha.400">Compras</Th>
                                <Th color="whiteAlpha.400">Puntos (Loyalty)</Th>
                                <Th color="whiteAlpha.400" textAlign="right">Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {customers.map((customer) => (
                                <Tr key={customer.id} _hover={{ bg: "whiteAlpha.50" }} transition="all 0.2s">
                                    <Td>
                                        <HStack spacing={3}>
                                            <Avatar size="sm" name={`${customer.name} ${customer.lastName}`} bg="amber.500" />
                                            <Stack spacing={0}>
                                                <Text fontWeight="bold">{customer.name ? `${customer.name} ${customer.lastName}` : "Sin nombre"}</Text>
                                                <Text fontSize="xs" color="whiteAlpha.500">{customer.email}</Text>
                                            </Stack>
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={customer.role === "ADMIN" ? "purple" : "gray"}>
                                            {customer.role}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <HStack spacing={1}>
                                            <FiShoppingBag opacity={0.6} />
                                            <Text fontSize="sm">{customer._count?.orders || 0}</Text>
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme="amber" variant="subtle" p={1} borderRadius="md" cursor="help" title="Click para ajustar" onClick={() => handleAdjustPoints(customer)}>
                                            {calculateTotalPoints(customer.loyalty)} pts
                                        </Badge>
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack spacing={2} justify="flex-end">
                                            <IconButton
                                                aria-label="Ajustar Puntos"
                                                icon={<FiStar />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="amber"
                                                onClick={() => handleAdjustPoints(customer)}
                                            />
                                            <IconButton
                                                aria-label="Editar Perfil"
                                                icon={<FiEdit2 />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => handleEditCustomer(customer)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            {/* MODAL PERFIL */}
            <Modal isOpen={customerModal.isOpen} onClose={customerModal.onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
                <ModalContent bg="background.800" borderColor="whiteAlpha.200" borderWidth="1px">
                    <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
                        <ModalHeader>Editar Perfil de Cliente</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={4}>
                                <HStack>
                                    <FormControl>
                                        <FormLabel fontSize="sm">Nombre</FormLabel>
                                        <Input {...customerForm.register("name")} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="sm">Apellidos</FormLabel>
                                        <Input {...customerForm.register("lastName")} />
                                    </FormControl>
                                </HStack>

                                <FormControl>
                                    <FormLabel fontSize="sm">Rol de Usuario</FormLabel>
                                    <Select {...customerForm.register("role")}>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </ModalBody>
                        <ModalFooter gap={3}>
                            <Button onClick={customerModal.onClose} variant="ghost">Cancelar</Button>
                            <Button type="submit" colorScheme="amber" isLoading={customerForm.formState.isSubmitting}>Guardar</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* MODAL LOYALTY */}
            <Modal isOpen={loyaltyModal.isOpen} onClose={loyaltyModal.onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
                <ModalContent bg="background.800" borderColor="whiteAlpha.200" borderWidth="1px">
                    <form onSubmit={loyaltyForm.handleSubmit(onLoyaltySubmit)}>
                        <ModalHeader>Ajustar Puntos de Lealtad</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack spacing={4}>
                                <Box p={3} borderRadius="lg" bg="whiteAlpha.50" borderWidth="1px" borderColor="amber.500">
                                    <Text fontSize="xs" fontWeight="bold" color="amber.500" mb={1}>CLIENTE</Text>
                                    <Text fontWeight="bold">{selectedCustomer?.email}</Text>
                                </Box>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Puntos (Positivos o Negativos)</FormLabel>
                                    <Input type="number" {...loyaltyForm.register("points", { required: true })} placeholder="Ej. 100 o -50" />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Motivo del ajuste</FormLabel>
                                    <Input {...loyaltyForm.register("reason", { required: true })} placeholder="Ej. Compra física, Devolución, Bono regalo" />
                                </FormControl>

                                <Divider />

                                <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.400">HISTORIAL RECIENTE</Text>
                                <Stack spacing={2}>
                                    {selectedCustomer?.loyalty?.map(entry => (
                                        <Flex key={entry.id} justify="space-between" fontSize="xs" p={2} bg="whiteAlpha.50" borderRadius="md">
                                            <Text>{entry.reason}</Text>
                                            <Text fontWeight="bold" color={entry.points >= 0 ? "green.400" : "red.400"}>
                                                {entry.points >= 0 ? "+" : ""}{entry.points}
                                            </Text>
                                        </Flex>
                                    ))}
                                </Stack>
                            </Stack>
                        </ModalBody>
                        <ModalFooter gap={3}>
                            <Button onClick={loyaltyModal.onClose} variant="ghost">Cerrar</Button>
                            <Button type="submit" colorScheme="amber" isLoading={loyaltyForm.formState.isSubmitting}>Aplicar Ajuste</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
