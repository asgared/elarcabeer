"use client";

import {
  Badge,
  Card,
  CardBody,
  Heading,
  HStack,
  Image,
  Stack,
  Text
} from "@chakra-ui/react";
import NextLink from "next/link";

import {bundles} from "../../data/bundles";
import {products} from "../../data/products";
import {Bundle} from "../../types/catalog";
import {formatCurrency} from "../../utils/currency";

export function BundleCard({bundle}: {bundle: Bundle}) {
  const totalProducts = bundle.products.reduce((sum, item) => sum + item.quantity, 0);
  const includedStyles = bundle.products
    .map((bundleProduct) => products.find((product) => product.id === bundleProduct.productId)?.style)
    .filter(Boolean)
    .join(" · ");

  return (
    <Card as={NextLink} href={`/bundles/${bundle.slug}`} transition="all 0.2s" _hover={{transform: "translateY(-6px)"}}>
      <CardBody>
        <Image
          alt={bundle.name}
          borderRadius="xl"
          fallbackSrc="/images/beer-bg.jpg"
          h={240}
          objectFit="cover"
          src={bundle.image}
        />
        <Stack spacing={3} mt={6}>
          <HStack justify="space-between">
            <Heading size="md">{bundle.name}</Heading>
            <Badge colorScheme="teal">Ahorra {bundle.savingsPercentage}%</Badge>
          </HStack>
          <Text color="whiteAlpha.700">{includedStyles}</Text>
          <HStack justify="space-between">
            <Text fontWeight="semibold">{formatCurrency(bundle.price)}</Text>
            <Text color="whiteAlpha.600">{totalProducts} piezas</Text>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

export function getBundleBySlug(slug: string) {
  return bundles.find((bundle) => bundle.slug === slug);
}
