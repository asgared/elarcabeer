import {Container} from "@/components/ui/container";
import {Grid, GridItem, Heading, SimpleGrid, Stack, Text} from "@chakra-ui/react";

import {BrandHero} from "@/components/ui/brand-hero";
import {BundleCard} from "@/components/ui/bundle-card";
import {LoyaltyProgress} from "@/components/ui/loyalty-progress";
import {ProductCard} from "@/components/ui/product-card";
import {StoreMap} from "@/components/ui/store-map";
import {bundles} from "@/data/bundles";
import {products} from "@/data/products";
import {stores} from "@/data/stores";
import {loyaltyProgress} from "@/data/subscriptions";
import {getCmsContent} from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroContent = await getCmsContent("home-hero");

  return (
    <Container maxW="7xl">
      <Stack spacing={16}>
        <BrandHero
          content={{
            title: heroContent?.title,
            subtitle: heroContent?.subtitle,
            body: heroContent?.body,
            imageUrl: heroContent?.imageUrl
          }}
        />

        <Stack spacing={6}>
          <Heading size="lg">Cervezas destacadas</Heading>
          <SimpleGrid columns={{base: 1, md: 3}} gap={8}>
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack spacing={6}>
          <Heading size="lg">Bundles que conquistan</Heading>
          <SimpleGrid columns={{base: 1, md: 3}} gap={8}>
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </SimpleGrid>
        </Stack>

        <Grid gap={12} templateColumns={{base: "1fr", lg: "2fr 1fr"}}>
          <GridItem>
            <Heading size="lg" mb={4}>
              Descubre nuestras tabernas
            </Heading>
            <StoreMap stores={stores} />
          </GridItem>
          <GridItem>
            <Stack spacing={6}>
              <Heading size="lg">Programa de lealtad</Heading>
              <Text color="whiteAlpha.700">
                Gana puntos con cada compra, desbloquea experiencias de catas privadas y acceso a lanzamientos.
              </Text>
              <LoyaltyProgress progress={loyaltyProgress} />
            </Stack>
          </GridItem>
        </Grid>
      </Stack>
    </Container>
  );
}
