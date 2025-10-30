import {Container} from "@/components/ui/container";
import {SiteAppLayout} from "@/components/layout/site-app-layout";
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
    <SiteAppLayout>
      <Container maxW="7xl">
        <div className="flex flex-col gap-16">
          <BrandHero
            content={{
              title: heroContent?.title,
              subtitle: heroContent?.subtitle,
              body: heroContent?.body,
              imageUrl: heroContent?.imageUrl,
            }}
          />

            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Cervezas destacadas</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {products.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Bundles que conquistan</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {bundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} />
                ))}
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
              <div>
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
                  Descubre nuestras tabernas
                </h2>
                <StoreMap stores={stores} />
              </div>
              <div>
                <div className="flex flex-col gap-6">
                  <h2 className="text-2xl font-semibold md:text-3xl">Programa de lealtad</h2>
                  <p className="text-white/70">
                    Gana puntos con cada compra, desbloquea experiencias de catas privadas y acceso a lanzamientos.
                  </p>
                  <LoyaltyProgress progress={loyaltyProgress} />
                </div>
              </div>
            </div>
        </div>
      </Container>
    </SiteAppLayout>
  );
}
