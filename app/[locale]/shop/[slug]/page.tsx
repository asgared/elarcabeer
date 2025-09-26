import {
  Badge,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  Select,
  Stack,
  Text
} from "@chakra-ui/react";
import {Metadata} from "next";
import {notFound} from "next/navigation";
import {AddToCartButton} from "@/components/cart/add-to-cart-button";
import {CheckList} from "@/components/ui/check-list";
import {Price} from "@/components/ui/price";
import {products} from "@/data/products";
import {Product} from "@/types/catalog";

const getProduct = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  const product = getProduct(params.slug);

  if (!product) {
    return {
      title: "Producto no encontrado"
    };
  }

  return {
    title: product.name,
    description: product.description
  };
}

export default function ProductDetailPage({params}: {params: {slug: string}}) {
  const product = getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <Container maxW="6xl">
      <Grid gap={12} templateColumns={{base: "1fr", lg: "1.2fr 1fr"}}>
        <GridItem>
          <Stack spacing={4}>
            <Image
              alt={product.name}
              borderRadius="3xl"
              fallbackSrc="/images/beer-bg.jpg"
              src={product.heroImage}
            />
            <Stack direction="row" spacing={4}>
              {product.gallery.map((image) => (
                <Image
                  key={image}
                  alt={product.name}
                  borderRadius="xl"
                  fallbackSrc="/images/beer-bg.jpg"
                  h={120}
                  objectFit="cover"
                  src={image}
                />
              ))}
            </Stack>
          </Stack>
        </GridItem>
        <GridItem>
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Heading size="2xl">{product.name}</Heading>
              <Text color="whiteAlpha.700">{product.style}</Text>
              {product.limitedEdition ? <Badge colorScheme="yellow">Edición limitada</Badge> : null}
            </Stack>
            <Text fontSize="lg" color="whiteAlpha.800">
              {product.description}
            </Text>
            <Box borderRadius="2xl" borderWidth="1px" p={6}>
              <Text fontWeight="semibold" mb={3}>
                Selecciona presentación
              </Text>
              <Stack spacing={4}>
                {product.variants.map((variant) => (
                  <Box
                    key={variant.id}
                    alignItems="center"
                    borderRadius="xl"
                    borderWidth="1px"
                    display="flex"
                    justifyContent="space-between"
                    p={4}
                  >
                    <Stack spacing={1}>
                      <Text fontWeight="bold">{variant.name}</Text>
                      <Text color="whiteAlpha.600">
                        {variant.abv}% ABV · {variant.ibu} IBU · {variant.packSize} piezas
                      </Text>
                    </Stack>
                    <Stack align="flex-end">
                      <Price amount={variant.price} fontSize="lg" />
                      <AddToCartButton productId={product.id} variant={variant} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box borderRadius="2xl" borderWidth="1px" p={6}>
              <Heading size="md" mb={4}>
                Tasting notes & maridajes
              </Heading>
              <Grid gap={6} templateColumns={{base: "1fr", md: "repeat(2, minmax(0, 1fr))"}}>
                <Stack>
                  <Text fontWeight="semibold">Notas</Text>
                  <CheckList items={product.tastingNotes} />
                </Stack>
                <Stack>
                  <Text fontWeight="semibold">Maridaje sugerido</Text>
                  <CheckList items={product.pairings} />
                </Stack>
              </Grid>
            </Box>
          </Stack>
        </GridItem>
      </Grid>
    </Container>
  );
}
