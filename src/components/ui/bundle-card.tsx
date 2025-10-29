"use client";

import Image from "next/image";
import Link from "next/link";

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
    <Link
      className="group block overflow-hidden rounded-3xl border border-white/10 bg-[rgba(12,27,30,0.7)] p-5 shadow-card transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-20px_rgba(12,27,30,0.8)] md:p-6"
      href={`/bundles/${bundle.slug}`}
    >
      <div className="relative h-60 overflow-hidden rounded-2xl">
        <Image
          alt={bundle.name}
          className="rounded-2xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fill
          src={bundle.image ?? "/images/beer-bg.jpg"}
          sizes="(min-width: 1024px) 420px, (min-width: 768px) 360px, 280px"
        />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug">{bundle.name}</h3>
          <span className="rounded-full bg-teal-400/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#003437]">
            Ahorra {bundle.savingsPercentage}%
          </span>
        </div>
        <p className="text-sm text-white/70">{includedStyles}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{formatCurrency(bundle.price)}</span>
          <span className="text-white/60">{totalProducts} piezas</span>
        </div>
      </div>
    </Link>
  );
}

export function getBundleBySlug(slug: string) {
  return bundles.find((bundle) => bundle.slug === slug);
}
