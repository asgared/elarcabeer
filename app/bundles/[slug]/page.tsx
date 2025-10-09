import {Container} from "@/components/ui/container";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text
} from "@chakra-ui/react";
import {Metadata} from "next";
import {notFound} from "next/navigation";
import {FaCheck} from "react-icons/fa6";

import {AddToCartButton} from "@/components/cart/add-to-cart-button";
import {Price} from "@/components/ui/price";
import {products} from "@/data/products";
import {getBundleBySlug} from "@/components/ui/bundle-card";
import type {Product} from "@/types/catalog";

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  const bundle = getBundleBySlug(params.slug);

  if (!bundle) {
    return {
      title: "Bundle no encontrado"
    };
  }

  return {
    title: bundle.name,
    description: bundle.description
  };
}

export default function BundlePage({params}: {params: {slug: string}}) {
  const bundle = getBundleBySlug(params.slug);

  if (!bundle) {
    notFound();
  }

  const includedProducts = bundle.products
    .map(({productId, quantity}) => {
      const product = products.find((item) => item.id === productId);
      return product ? {product, quantity} : null;
    })
    .filter((entry): entry is {product: Product; quantity: number} => entry !== null);

  return (
    <Container maxW="5xl">
      <Stack spacing={8}>
        <Heading size="2xl">{bundle.name}</Heading>
        <Text color="whiteAlpha.700" fontSize="lg">
          {bundle.description}
        </Text>
        <Grid gap={12} templateColumns={{base: "1fr", md: "1fr 1fr"}}>
          <GridItem>
            <Box borderRadius="2xl" borderWidth="1px" p={6}>
              <Heading size="md" mb={4}>
                Lo que incluye
              </Heading>
              <List spacing={2}>
                {includedProducts.map(({product, quantity}) => (
                  <ListItem key={product!.id} color="whiteAlpha.800">
                    <ListIcon as={FaCheck} color="brand.400" />
                    {quantity}x {product!.name}
                  </ListItem>
                ))}
              </List>
            </Box>
          </GridItem>
          <GridItem>
            <Stack spacing={6}>
              <Price amount={bundle.price} fontSize="3xl" />
              <Text color="whiteAlpha.600">Ahorra {bundle.savingsPercentage}% vs comprar por separado.</Text>
              {includedProducts.map(({product}) => (
                product?.variants[0] ? (
                  <AddToCartButton
                    key={product.id}
                    productId={product.id}
                    variant={product.variants[0]}
                  />
                ) : null
              ))}
            </Stack>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}
