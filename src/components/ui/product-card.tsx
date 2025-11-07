"use client";

import {motion} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import {Product} from "../../types/catalog";
import {formatCurrency} from "../../utils/currency";

const cardVariants = {
  initial: {opacity: 0, y: 18},
  animate: {opacity: 1, y: 0},
};

export function ProductCard({product}: {product: Product}) {
  const hasVariants = product.variants.length > 0;
  const minPrice = hasVariants ? Math.min(...product.variants.map((variant) => variant.price)) : null;
  const rating = typeof product.rating === "number" && product.rating > 0 ? product.rating : null;

  return (
    <motion.div
      className="h-full"
      initial="initial"
      animate="animate"
      variants={cardVariants}
      transition={{duration: 0.45, ease: "easeOut"}}
    >
      <Link
        className="group flex h-full flex-col gap-5 rounded-[1.75rem] border border-border/60 bg-card/90 p-6 shadow-[0_28px_68px_-40px_rgba(4,12,22,0.95)] transition-transform duration-200 hover:-translate-y-1 hover:border-accent/60 md:gap-6"
        href={`/shop/${product.slug}`}
      >
        <div className="relative overflow-hidden rounded-2xl">
          {product.limitedEdition ? (
            <span className="absolute right-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-soft">
              Edición limitada
            </span>
          ) : null}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-background/80">
            <Image
              alt={product.name}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fill
              src={product.heroImage ?? "/images/beer-bg.jpg"}
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 240px"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <h3
            className="font-heading text-lg font-semibold leading-snug text-foreground"
            style={{display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"}}
          >
            {product.name}
          </h3>
          <p
            className="text-sm text-muted-foreground"
            style={{display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"}}
          >
            {product.style}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            {hasVariants && minPrice !== null ? (
              <span className="text-base font-semibold text-foreground">{formatCurrency(minPrice)}</span>
            ) : (
              <span className="text-muted-foreground">Próximamente</span>
            )}
            {rating ? (
              <span className="flex items-center gap-1 rounded-full bg-background/60 px-2 py-1 text-xs font-semibold text-primary">
                <span>{rating.toFixed(1)}</span>
                <span className="text-primary">★</span>
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
