import {
  Badge,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import {Metadata} from "next";
import {notFound} from "next/navigation";

import {AddToCartButton} from "@/components/cart/add-to-cart-button";
import {CheckList} from "@/components/ui/check-list";
import {Price} from "@/components/ui/price";
import {getProductBySlug} from "@/lib/catalog";

type PageParams = {
  params: {slug: string};
};

export async function generateMetadata({params}: PageParams): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) {
      return {title: "Producto no encontrado"};
    }

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        images: product.imageUrl ? [{url: product.imageUrl}] : undefined
      }
    };
  } catch (error) {
    console.error("Error generating metadata for product", params.slug, error);

    return {title: "Producto no disponible"};
  }
}

export default async function ProductDetailPage({params}: PageParams) {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) {
      notFound();
    }

    const primaryImage = product.imageUrl ?? product.heroImage;
    const galleryImages = product.gallery?.length ? product.gallery : [primaryImage];
    const tastingNotes = product.tastingNotes ?? [];
    const pairings = product.pairings ?? [];
    const hasVariants = product.variants.length > 0;

    return (
      <Container maxW="6xl" py={{base: 6, md: 12}}>
        <Grid gap={{base: 10, lg: 12}} templateColumns={{base: "1fr", lg: "1.2fr 1fr"}}>
          <GridItem>
            <Stack spacing={{base: 6, md: 8}}>
              <Image
                alt={product.name}
                borderRadius="3xl"
                fallbackSrc="/images/beer-bg.jpg"
                src={primaryImage}
              />
              {galleryImages.length > 1 ? (
                <SimpleGrid columns={{base: 2, md: Math.min(4, galleryImages.length)}} spacing={4}>
                  {galleryImages.map((image) => (
                    <Image
                      key={image}
                      alt={product.name}
                      borderRadius="xl"
                      fallbackSrc="/images/beer-bg.jpg"
                      h={{base: 100, md: 120}}
                      objectFit="cover"
                      src={image}
                    />
                  ))}
                </SimpleGrid>
              ) : null}
            </Stack>
          </GridItem>
          <GridItem>
            <Stack spacing={{base: 6, md: 8}}>
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
                {hasVariants ? (
                  <Stack spacing={4}>
                    {product.variants.map((variant) => (
                      <Box
                        key={variant.id}
                        alignItems={{base: "flex-start", sm: "center"}}
                        borderRadius="xl"
                        borderWidth="1px"
                        display={{base: "grid", sm: "flex"}}
                        gap={{base: 3, sm: 4}}
                        justifyContent="space-between"
                        p={4}
                      >
                        <Stack spacing={1}>
                          <Text fontWeight="bold">{variant.name}</Text>
                          <Text color="whiteAlpha.600">
                            {variant.abv}% ABV · {variant.ibu} IBU · {variant.packSize} piezas
                          </Text>
                        </Stack>
                        <Stack align={{base: "flex-start", sm: "flex-end"}} spacing={2}>
                          <Price amount={variant.price} fontSize="lg" />
                          <AddToCartButton productId={product.id} variant={variant} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Text color="whiteAlpha.600">Este producto estará disponible próximamente.</Text>
                )}
              </Box>
              {(tastingNotes.length > 0 || pairings.length > 0) && (
                <Box borderRadius="2xl" borderWidth="1px" p={6}>
                  <Heading size="md" mb={4}>
                    Tasting notes & maridajes
                  </Heading>
                  <Grid gap={6} templateColumns={{base: "1fr", md: "repeat(2, minmax(0, 1fr))"}}>
                    {tastingNotes.length > 0 ? (
                      <Stack>
                        <Text fontWeight="semibold">Notas</Text>
                        <CheckList items={tastingNotes} />
                      </Stack>
                    ) : null}
                    {pairings.length > 0 ? (
                      <Stack>
                        <Text fontWeight="semibold">Maridaje sugerido</Text>
                        <CheckList items={pairings} />
                      </Stack>
                    ) : null}
                  </Grid>
                </Box>
              )}
            </Stack>
          </GridItem>
        </Grid>
      </Container>
    );
  } catch (error) {
    console.error("Error loading product detail", params.slug, error);
    notFound();
  }
}

