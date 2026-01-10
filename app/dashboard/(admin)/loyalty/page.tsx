"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Badge,
    Spinner,
    Center,
    SimpleGrid,
    Icon,
    Divider,
} from "@chakra-ui/react";
import { FiStar, FiTrendingUp, FiGift, FiAward } from "react-icons/fi";

type LoyaltyStats = {
    totalPointsIssued: number;
    activeUsers: number;
    rewardsRedeemedCurrentMonth: number;
};

export default function LoyaltyAdminPage() {
    const [stats, setStats] = useState<LoyaltyStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLoyaltyData = useCallback(async () => {
        try {
            setIsLoading(true);
            // Simulación para visualización inmediata ya que la funcionalidad de ledger ya existe en Clientes
            setTimeout(() => {
                setStats({
                    totalPointsIssued: 45800,
                    activeUsers: 156,
                    rewardsRedeemedCurrentMonth: 12
                });
                setRecentActivity([
                    { id: "1", user: "miguel@example.com", points: 500, reason: "Bono Bienvenida", date: "Hace 2 horas" },
                    { id: "2", user: "ale@arca.com", points: -200, reason: "Canje Cerveza Premium", date: "Hace 5 horas" },
                    { id: "3", user: "juan@mail.com", points: 150, reason: "Compra Sucursal Coyoacán", date: "Ayer" },
                ]);
                setIsLoading(false);
            }, 700);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchLoyaltyData();
    }, [fetchLoyaltyData]);

    return (
        <Stack spacing={8}>
            <Stack spacing={1}>
                <Heading size="lg" letterSpacing="tight">Programa de Lealtad</Heading>
                <Text color="whiteAlpha.600">Configuración global y rendimiento de puntos.</Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box p={6} bg="whiteAlpha.100" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                    <HStack color="amber.500" mb={2}>
                        <FiAward />
                        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">Puntos Emitidos</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">{stats?.totalPointsIssued.toLocaleString() || "0"}</Text>
                </Box>
                <Box p={6} bg="whiteAlpha.100" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                    <HStack color="blue.400" mb={2}>
                        <FiTrendingUp />
                        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">Usuarios Activos</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">{stats?.activeUsers || "0"}</Text>
                </Box>
                <Box p={6} bg="whiteAlpha.100" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                    <HStack color="purple.400" mb={2}>
                        <FiGift />
                        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">Canjes (Mes)</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">{stats?.rewardsRedeemedCurrentMonth || "0"}</Text>
                </Box>
            </SimpleGrid>

            <Box bg="whiteAlpha.50" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.100" overflow="hidden">
                <Box p={4} borderBottomWidth="1px" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
                    <Text fontWeight="bold" fontSize="sm">Últimos Movimientos del Ledger</Text>
                </Box>
                {isLoading ? (
                    <Center py={20}>
                        <Spinner color="amber.500" />
                    </Center>
                ) : (
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th color="whiteAlpha.400">Usuario</Th>
                                <Th color="whiteAlpha.400">Motivo</Th>
                                <Th color="whiteAlpha.400">Puntos</Th>
                                <Th color="whiteAlpha.400">Fecha</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recentActivity.map(activity => (
                                <Tr key={activity.id}>
                                    <Td fontSize="sm">{activity.user}</Td>
                                    <Td fontSize="sm">{activity.reason}</Td>
                                    <Td>
                                        <Badge colorScheme={activity.points >= 0 ? "green" : "red"}>
                                            {activity.points >= 0 ? "+" : ""}{activity.points}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="xs" color="whiteAlpha.500">{activity.date}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            <Box p={8} bg="amber.500" borderRadius="xl" color="black">
                <HStack spacing={4} align="center">
                    <Icon as={FiStar} fontSize="3xl" />
                    <Box>
                        <Heading size="md" mb={1}>¿Necesitas crear una nueva regla?</Heading>
                        <Text fontSize="sm" opacity={0.8}>Pronto podrás configurar multiplicadores de puntos y recompensas automáticas desde aquí.</Text>
                    </Box>
                </HStack>
            </Box>
        </Stack>
    );
}
