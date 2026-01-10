"use client";

import { useEffect, useState } from "react";
import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Heading,
    Text,
    Stack,
    Flex,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    FiTrendingUp, FiShoppingBag, FiUsers,
    FiActivity, FiPackage, FiDollarSign
} from "react-icons/fi";

const StatCard = ({ title, value, helpText, icon, type = "increase" }: any) => {
    const bg = "whiteAlpha.100";
    const borderColor = "whiteAlpha.200";

    return (
        <Box
            p={6}
            bg={bg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            transition="transform 0.2s"
            _hover={{ transform: "translateY(-4px)", borderColor: "amber.500" }}
        >
            <Flex align="center" justify="space-between" mb={4}>
                <Box p={3} borderRadius="lg" bg="amber.500" color="black">
                    <Icon as={icon} fontSize="xl" />
                </Box>
                <StatHelpText m={0} display="flex" alignItems="center">
                    <StatArrow type={type} />
                    {helpText}
                </StatHelpText>
            </Flex>
            <Stat>
                <StatLabel color="whiteAlpha.600" fontWeight="medium">
                    {title}
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold" color="white">
                    {value}
                </StatNumber>
            </Stat>
        </Box>
    );
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulación de carga de datos para el despliegue visual inmediato profesional
        setTimeout(() => {
            setStats({
                revenue: "$124,500.00",
                orders: "842",
                users: "2,150",
                stock: "45",
                conversion: "3.2%",
                averageTicket: "$350.00"
            });
            setIsLoading(false);
        }, 800);
    }, []);

    return (
        <Stack spacing={8}>
            <Stack spacing={1}>
                <Heading size="lg" letterSpacing="tight">Analíticas y Métricas</Heading>
                <Text color="whiteAlpha.600">Rendimiento global del negocio en tiempo real.</Text>
            </Stack>

            {isLoading ? (
                <Flex justify="center" align="center" py={20}>
                    <Text color="whiteAlpha.500">Generando reportes...</Text>
                </Flex>
            ) : (
                <>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        <StatCard
                            title="Ingresos Totales (Mes)"
                            value={stats.revenue}
                            helpText="12% vs mes anterior"
                            icon={FiDollarSign}
                        />
                        <StatCard
                            title="Órdenes Completadas"
                            value={stats.orders}
                            helpText="5.4% vs mes anterior"
                            icon={FiShoppingBag}
                        />
                        <StatCard
                            title="Nuevos Usuarios"
                            value={stats.users}
                            helpText="18% vs mes anterior"
                            icon={FiUsers}
                        />
                    </SimpleGrid>

                    <Box p={8} bg="whiteAlpha.100" borderRadius="xl" borderWidth="1px" borderColor="whiteAlpha.200">
                        <Flex align="center" gap={3} mb={6}>
                            <Icon as={FiActivity} color="amber.500" fontSize="2xl" />
                            <Heading size="md">Actividad de Sucursales</Heading>
                        </Flex>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                            <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
                                <Text fontSize="xs" color="whiteAlpha.400" mb={1}>CONVERSIÓN</Text>
                                <Text fontSize="xl" fontWeight="bold">4.8%</Text>
                            </Box>
                            <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
                                <Text fontSize="xs" color="whiteAlpha.400" mb={1}>TICKET PROMEDIO</Text>
                                <Text fontSize="xl" fontWeight="bold">$420 MXN</Text>
                            </Box>
                            <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
                                <Text fontSize="xs" color="whiteAlpha.400" mb={1}>FIDELIZACIÓN</Text>
                                <Text fontSize="xl" fontWeight="bold">65%</Text>
                            </Box>
                            <Box p={4} bg="whiteAlpha.50" borderRadius="lg">
                                <Text fontSize="xs" color="whiteAlpha.400" mb={1}>PEDIDOS PENDIENTES</Text>
                                <Text fontSize="xl" fontWeight="bold" color="amber.500">12</Text>
                            </Box>
                        </SimpleGrid>

                        <Box mt={10} p={10} textAlign="center" borderStyle="dashed" borderWidth="2px" borderColor="whiteAlpha.100" borderRadius="xl">
                            <FiTrendingUp size={40} style={{ margin: "0 auto", opacity: 0.2 }} />
                            <Text mt={4} color="whiteAlpha.300">Gráficos de tendencia próximamente (Integración Chart.js)</Text>
                        </Box>
                    </Box>
                </>
            )}
        </Stack>
    );
}
