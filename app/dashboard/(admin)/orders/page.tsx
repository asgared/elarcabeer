"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    IconButton,
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
    Select,
    Divider,
    Icon,
} from "@chakra-ui/react";
import { FiShoppingBag, FiEye, FiCheckCircle, FiTruck, FiAlertCircle } from "react-icons/fi";

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
};

type Order = {
    id: string;
    userId: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
        email: string;
        name?: string | null;
        lastName?: string | null;
    };
    items: OrderItem[];
    payment?: {
        status: string;
        amount: number;
        stripeSessionId: string;
    } | null;
};

const statusColors: Record<string, string> = {
    PENDING: "orange",
    PAID: "green",
    SHIPPED: "blue",
    DELIVERED: "teal",
    CANCELLED: "red"
};

const statusIcons: Record<string, any> = {
    PENDING: FiAlertCircle,
    PAID: FiCheckCircle,
    SHIPPED: FiTruck,
    DELIVERED: FiCheckCircle,
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/dashboard/orders");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al cargar órdenes");
            setOrders(data.orders || []);
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
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const response = await fetch("/api/dashboard/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!response.ok) throw new Error("Error al actualizar estado");

            toast({ title: "Estado actualizado", status: "success" });
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            toast({ title: "Error", status: "error" });
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        onOpen();
    };

    const currencyFormatter = useMemo(
        () => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }),
        []
    );

    return (
        <Stack spacing={8}>
            <Flex align="center" justify="space-between">
                <Stack spacing={1}>
                    <Heading size="lg" letterSpacing="tight">Gestión de Órdenes</Heading>
                    <Text color="whiteAlpha.600">Monitoreo de ventas y logística de entrega.</Text>
                </Stack>
            </Flex>

            <Box bg="whiteAlpha.50" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
                {isLoading ? (
                    <Center py={20}>
                        <Spinner color="amber.500" />
                    </Center>
                ) : orders.length === 0 ? (
                    <Center py={20} flexDirection="column" gap={4}>
                        <FiShoppingBag size={40} opacity={0.2} />
                        <Text color="whiteAlpha.500">No hay órdenes registradas aún.</Text>
                    </Center>
                ) : (
                    <Table variant="simple">
                        <Thead bg="whiteAlpha.50">
                            <Tr>
                                <Th color="whiteAlpha.400">ID / Fecha</Th>
                                <Th color="whiteAlpha.400">Cliente</Th>
                                <Th color="whiteAlpha.400" isNumeric>Total</Th>
                                <Th color="whiteAlpha.400">Estado</Th>
                                <Th color="whiteAlpha.400" textAlign="right">Acciones</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {orders.map((order) => (
                                <Tr key={order.id} _hover={{ bg: "whiteAlpha.50" }} transition="all 0.2s">
                                    <Td>
                                        <Stack spacing={0}>
                                            <Text fontWeight="bold" fontSize="xs" fontFamily="mono">#{order.id.slice(-8).toUpperCase()}</Text>
                                            <Text fontSize="xs" color="whiteAlpha.500">{new Date(order.createdAt).toLocaleDateString()}</Text>
                                        </Stack>
                                    </Td>
                                    <Td>
                                        <Stack spacing={0}>
                                            <Text fontWeight="semibold" fontSize="sm">{order.user.name || "Usuario"}</Text>
                                            <Text fontSize="xs" color="whiteAlpha.500">{order.user.email}</Text>
                                        </Stack>
                                    </Td>
                                    <Td isNumeric fontWeight="bold">
                                        {currencyFormatter.format(order.total / 100)}
                                    </Td>
                                    <Td>
                                        <HStack spacing={2}>
                                            <Badge colorScheme={statusColors[order.status] || "gray"} variant="subtle" px={2} borderRadius="full">
                                                {order.status}
                                            </Badge>
                                            {order.payment?.status === "PAID" && (
                                                <Badge colorScheme="green" variant="solid" boxSize="8px" borderRadius="full" title="Pagado" />
                                            )}
                                        </HStack>
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack spacing={2} justify="flex-end">
                                            <IconButton
                                                aria-label="Ver Detalles"
                                                icon={<FiEye />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="amber"
                                                onClick={() => handleViewDetails(order)}
                                            />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
                <ModalContent bg="background.800" borderColor="whiteAlpha.200" borderWidth="1px">
                    <ModalHeader>Detalles de la Orden</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedOrder && (
                            <Stack spacing={6}>
                                <Flex justify="space-between" align="center">
                                    <Box>
                                        <Text fontSize="xs" color="whiteAlpha.400" textTransform="uppercase">Estado Actual</Text>
                                        <HStack mt={1}>
                                            <Icon as={statusIcons[selectedOrder.status] || FiAlertCircle} color={`${statusColors[selectedOrder.status]}.400`} />
                                            <Text fontWeight="bold" color={`${statusColors[selectedOrder.status]}.400`}>{selectedOrder.status}</Text>
                                        </HStack>
                                    </Box>
                                    <Box textAlign="right">
                                        <Text fontSize="xs" color="whiteAlpha.400" textTransform="uppercase">Cambiar Estado</Text>
                                        <Select
                                            size="sm"
                                            mt={1}
                                            value={selectedOrder.status}
                                            onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                        >
                                            <option value="PENDING">Pendiente</option>
                                            <option value="PAID">Pagado</option>
                                            <option value="SHIPPED">Enviado</option>
                                            <option value="DELIVERED">Entregado</option>
                                            <option value="CANCELLED">Cancelado</option>
                                        </Select>
                                    </Box>
                                </Flex>

                                <Divider borderColor="whiteAlpha.100" />

                                <Box>
                                    <Text fontSize="xs" fontWeight="bold" color="amber.500" mb={3} textTransform="uppercase">Productos</Text>
                                    <Stack spacing={2}>
                                        {selectedOrder.items.map(item => (
                                            <Flex key={item.id} justify="space-between" align="center" p={2} bg="whiteAlpha.50" borderRadius="md">
                                                <Text fontSize="sm">{item.name} <Text as="span" color="whiteAlpha.400">x{item.quantity}</Text></Text>
                                                <Text fontSize="sm" fontWeight="bold">{currencyFormatter.format((item.price * item.quantity) / 100)}</Text>
                                            </Flex>
                                        ))}
                                    </Stack>
                                    <Flex justify="space-between" mt={4} pt={2} borderTopWidth="1px" borderColor="whiteAlpha.100">
                                        <Text fontWeight="bold">TOTAL</Text>
                                        <Text fontWeight="bold" color="amber.500" fontSize="lg">{currencyFormatter.format(selectedOrder.total / 100)}</Text>
                                    </Flex>
                                </Box>

                                <Box>
                                    <Text fontSize="xs" fontWeight="bold" color="amber.500" mb={2} textTransform="uppercase">Información de Pago</Text>
                                    <Stack bg="whiteAlpha.50" p={3} borderRadius="md" spacing={1} fontSize="xs">
                                        {selectedOrder.payment ? (
                                            <>
                                                <Flex justify="space-between">
                                                    <Text color="whiteAlpha.500">Estado:</Text>
                                                    <Text fontWeight="bold" color="green.400">{selectedOrder.payment.status}</Text>
                                                </Flex>
                                                <Flex justify="space-between">
                                                    <Text color="whiteAlpha.500">Stripe ID:</Text>
                                                    <Text fontFamily="mono">{selectedOrder.payment.stripeSessionId}</Text>
                                                </Flex>
                                            </>
                                        ) : (
                                            <Text color="whiteAlpha.500 italic">No hay información de pago registrada.</Text>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} variant="ghost">Cerrar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
