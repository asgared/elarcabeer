import {Metadata} from "next";
import {notFound} from "next/navigation";
import {FaCheck} from "react-icons/fa6";

import {AddToCartButton} from "@/components/cart/add-to-cart-button";
import {Container} from "@/components/ui/container";
import {Price} from "@/components/ui/price";
import {getBundleBySlug} from "@/components/ui/bundle-card";
import {products} from "@/data/products";
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
    <Container className="max-w-5xl">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold md:text-4xl">{bundle.name}</h1>
        <p className="text-lg text-white/70">{bundle.description}</p>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-background/40 p-6">
            <h2 className="mb-4 text-xl font-semibold">Lo que incluye</h2>
            <ul className="space-y-2 text-sm text-white/80">
              {includedProducts.map(({product, quantity}) => (
                <li key={product!.id} className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-400">
                    <FaCheck className="h-4 w-4" />
                  </span>
                  <span>
                    {quantity}x {product!.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <Price amount={bundle.price} className="text-3xl" />
            <p className="text-sm text-white/60">
              Ahorra {bundle.savingsPercentage}% vs comprar por separado.
            </p>
            {includedProducts.map(({product}) => (
              product?.variants[0] ? (
                <AddToCartButton
                  key={product.id}
                  productId={product.id}
                  variant={product.variants[0]}
                />
              ) : null
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
