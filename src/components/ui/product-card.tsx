"use client";

import Image from "next/image";
import Link from "next/link";

import {Product} from "../../types/catalog";
import {formatCurrency} from "../../utils/currency";

export function ProductCard({product}: {product: Product}) {
  const hasVariants = product.variants.length > 0;
  const minPrice = hasVariants ? Math.min(...product.variants.map((variant) => variant.price)) : null;
  const rating = typeof product.rating === "number" && product.rating > 0 ? product.rating : null;

  return (
    <Link
      className="group flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-[rgba(12,27,30,0.7)] p-5 shadow-card transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-20px_rgba(12,27,30,0.8)] md:gap-6 md:p-6"
      href={`/shop/${product.slug}`}
    >
      <div className="relative overflow-hidden rounded-2xl">
        {product.limitedEdition ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-300/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f1300] shadow-soft">
            Edición limitada
          </span>
        ) : null}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#11272c]">
          <Image
            alt={product.name}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            fill
            src={product.heroImage ?? "/images/beer-bg.jpg"}
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 240px"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <h3
          className="text-lg font-semibold leading-snug"
          style={{display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"}}
        >
          {product.name}
        </h3>
        <p
          className="text-sm text-white/70"
          style={{display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"}}
        >
          {product.style}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          {hasVariants && minPrice !== null ? (
            <span className="font-semibold">{formatCurrency(minPrice)}</span>
          ) : (
            <span className="text-white/60">Próximamente</span>
          )}
          {rating ? (
            <span className="flex items-center gap-1 text-[#C6A15B]">
              <span className="font-bold">{rating.toFixed(1)}</span>
              <span className="text-white/60">★</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
