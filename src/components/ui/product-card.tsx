"use client";

import {
  Badge,
  Box,
  Card,
  CardBody,
  Heading,
  HStack,
  Image,
  Stack,
  Text
} from "@chakra-ui/react";
import {Link} from '@/i18n/navigation';

import {Product} from "../../types/catalog";
import {formatCurrency} from "../../utils/currency";

export function ProductCard({product}: {product: Product}) {
  const minPrice = Math.min(...product.variants.map((variant) => variant.price));

  return (
    <Card as={Link} href={`/shop/${product.slug}`} _hover={{transform: "translateY(-6px)"}} transition="all 0.2s">
      <CardBody>
        <Box position="relative">
          {product.limitedEdition ? (
            <Badge colorScheme="yellow" position="absolute" top={3} right={3}>
              Edición limitada
            </Badge>
          ) : null}
          <Image
            alt={product.name}
            borderRadius="xl"
            h={240}
            objectFit="cover"
            fallbackSrc="/images/beer-bg.jpg"
            src={product.heroImage}
            w="full"
          />
        </Box>
        <Stack spacing={3} mt={6}>
          <Heading size="md">{product.name}</Heading>
          <Text color="whiteAlpha.700">{product.style}</Text>
          <HStack justify="space-between">
            <Text fontWeight="semibold">
              {formatCurrency(minPrice)}
            </Text>
            <HStack spacing={1} color="gold.500">
              <Text fontWeight="bold">{product.rating.toFixed(1)}</Text>
              <Text color="whiteAlpha.600">★</Text>
            </HStack>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}
