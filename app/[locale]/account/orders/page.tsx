import {Box, Container, Heading, Stack, Text} from "@chakra-ui/react";

export default function OrdersPage() {
  const sampleOrders = [
    {
      id: "order-1001",
      total: "$1,450 MXN",
      status: "En tránsito",
      date: "12 marzo 2024"
    },
    {
      id: "order-1000",
      total: "$980 MXN",
      status: "Entregado",
      date: "28 febrero 2024"
    }
  ];

  return (
    <Container maxW="4xl">
      <Stack spacing={6}>
        <Heading size="2xl">Órdenes</Heading>
        {sampleOrders.map((order) => (
          <Box key={order.id} borderRadius="2xl" borderWidth="1px" p={6}>
            <Text fontWeight="bold">{order.id}</Text>
            <Text color="whiteAlpha.700">{order.date}</Text>
            <Text color="whiteAlpha.700">{order.status}</Text>
            <Text fontWeight="semibold">{order.total}</Text>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
