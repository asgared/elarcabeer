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
import {Link} from "@/i18n/navigation";

import {Product} from "../../types/catalog";
import {formatCurrency} from "../../utils/currency";

export function ProductCard({product}: {product: Product}) {
  const hasVariants = product.variants.length > 0;
  const minPrice = hasVariants ? Math.min(...product.variants.map((variant) => variant.price)) : null;
  const rating = typeof product.rating === "number" && product.rating > 0 ? product.rating : null;

  return (
    <Card
      as={Link}
      href={`/shop/${product.slug}`}
      _hover={{transform: "translateY(-6px)"}}
      h="full"
      transition="all 0.2s"
    >
      <CardBody display="flex" flexDirection="column" gap={6}>
        <Box position="relative">
          {product.limitedEdition ? (
            <Badge colorScheme="yellow" position="absolute" top={3} right={3}>
              Edición limitada
            </Badge>
          ) : null}
          <Image
            alt={product.name}
            borderRadius="xl"
            h={{base: 200, md: 240}}
            objectFit="cover"
            fallbackSrc="/images/beer-bg.jpg"
            src={product.heroImage}
            w="full"
          />
        </Box>
        <Stack spacing={3} flex="1">
          <Heading size="md">{product.name}</Heading>
          <Text color="whiteAlpha.700">{product.style}</Text>
          <HStack align={{base: "flex-start", md: "center"}} justify="space-between" spacing={3}>
            {hasVariants && minPrice !== null ? (
              <Text fontWeight="semibold">{formatCurrency(minPrice)}</Text>
            ) : (
              <Text color="whiteAlpha.600">Próximamente</Text>
            )}
            {rating ? (
              <HStack spacing={1} color="gold.500">
                <Text fontWeight="bold">{rating.toFixed(1)}</Text>
                <Text color="whiteAlpha.600">★</Text>
              </HStack>
            ) : null}
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}
