"use client";

import {
  AspectRatio,
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
      href={`/products/${product.slug}`}
      _hover={{transform: "translateY(-6px)"}}
      borderRadius="2xl"
      h="full"
      transition="all 0.2s"
    >
      <CardBody display="flex" flexDirection="column" gap={{base: 4, md: 6}} p={{base: 5, md: 6}}>
        <Box position="relative">
          {product.limitedEdition ? (
            <Badge colorScheme="yellow" position="absolute" top={3} right={3}>
              Edición limitada
            </Badge>
          ) : null}
          <AspectRatio ratio={4 / 5}>
            <Image
              alt={product.name}
              borderRadius="xl"
              fallbackSrc="/images/beer-bg.jpg"
              objectFit="cover"
              src={product.imageUrl ?? product.heroImage}
              w="full"
            />
          </AspectRatio>
        </Box>
        <Stack spacing={3} flex="1">
          <Heading size="md" noOfLines={2}>
            {product.name}
          </Heading>
          <Text color="whiteAlpha.700" fontSize="sm" noOfLines={2}>
            {product.style}
          </Text>
          <HStack
            align={{base: "flex-start", md: "center"}}
            justify="space-between"
            spacing={3}
            flexWrap="wrap"
          >
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
