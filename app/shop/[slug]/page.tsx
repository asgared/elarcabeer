import Image from "next/image";
import {Metadata} from "next";
import {notFound} from "next/navigation";

import {Container} from "@/components/ui/container";
import {AddToCartButton} from "@/components/cart/add-to-cart-button";
import {CheckList} from "@/components/ui/check-list";
import {Price} from "@/components/ui/price";
import {getProductBySlug, getProducts} from "@/lib/catalog";

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) {
      return {
        title: "Producto no encontrado"
      };
    }

    return {
      title: product.name,
      description: product.description
    };
  } catch (error) {
    console.error("Error generating metadata for product", params.slug, error);

    return {
      title: "Producto no disponible"
    };
  }
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();

    return products
      .filter((product) => {
        const slug = product?.slug;

        return typeof slug === "string" && slug.trim().length > 0;
      })
      .map((product) => ({
        slug: product.slug!,
      }));
  } catch (error) {
    console.error("Error generating static params for products:", error);

    return [];
  }
}

export default async function ProductDetailPage({params}: {params: {slug: string}}) {
  const product = await getProductBySlug(params.slug).catch((error) => {
    console.error("Error loading product detail", params.slug, error);

    return null;
  });

  if (!product) {
    notFound();
  }

  const galleryImages = product.gallery?.length ? product.gallery : [product.heroImage];
  const tastingNotes = product.tastingNotes ?? [];
  const pairings = product.pairings ?? [];
  const hasVariants = product.variants.length > 0;

  return (
    <Container className="max-w-6xl py-6 md:py-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-[0_35px_80px_-55px_rgba(4,12,22,0.9)]">
            <Image
              alt={product.name}
              className="h-full w-full object-cover"
              height={720}
              src={product.heroImage ?? "/images/beer-bg.jpg"}
              width={720}
            />
          </div>
          {galleryImages.length > 1 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryImages.map((image) => (
                <div key={image} className="overflow-hidden rounded-xl border border-border/60 bg-card/80">
                  <Image
                    alt={product.name}
                    className="h-full w-full object-cover"
                    height={160}
                    src={image ?? "/images/beer-bg.jpg"}
                    width={160}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
            <p className="text-sm text-muted-foreground md:text-base">{product.style}</p>
            {product.limitedEdition ? (
              <span className="inline-flex w-max items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Edición limitada
              </span>
            ) : null}
          </div>
          <p className="text-base text-muted-foreground md:text-lg">{product.description}</p>
          <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-[0_32px_70px_-50px_rgba(4,12,22,0.9)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Selecciona presentación
            </p>
            {hasVariants ? (
              <div className="flex flex-col gap-4">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 transition hover:border-accent/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">{variant.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {variant.abv}% ABV · {variant.ibu} IBU · {variant.packSize} piezas
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <Price amount={variant.price} className="text-lg text-foreground" />
                      <AddToCartButton productId={product.id} variant={variant} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Este producto estará disponible próximamente.</p>
            )}
          </div>
          {(tastingNotes.length > 0 || pairings.length > 0) && (
            <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-[0_32px_70px_-50px_rgba(4,12,22,0.9)]">
              <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">Tasting notes & maridajes</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {tastingNotes.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Notas</span>
                    <CheckList items={tastingNotes} />
                  </div>
                ) : null}
                {pairings.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Maridaje sugerido
                    </span>
                    <CheckList items={pairings} />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

