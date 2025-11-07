"use client";

import {useMemo, useState} from "react";
import {FaMagnifyingGlass} from "react-icons/fa6";

import {Input} from "@/components/ui/input";
import {Container} from "@/components/ui/container";
import {ProductCard} from "@/components/ui/product-card";
import {products} from "@/data/products";
import type {Product} from "@/types/catalog";

const styles: string[] = Array.from(new Set(products.map((product) => product.style)));

export default function ShopPage() {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(9000);

  const filtered = useMemo<Product[]>(() => {
    return products.filter((product) => {
      const matchStyle = !selectedStyle || product.style === selectedStyle;
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const minVariant = Math.min(...product.variants.map((variant) => variant.price));
      const matchPrice = minVariant <= maxPrice * 100;
      return matchStyle && matchSearch && matchPrice;
    });
  }, [selectedStyle, search, maxPrice]);

  return (
    <Container className="max-w-7xl">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">Shop</h1>
          <p className="text-muted-foreground">
            Filtra por estilo y precio para encontrar tu tesoro líquido.
          </p>
        </div>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="flex w-full flex-shrink-0 flex-col gap-6 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[0_30px_70px_-45px_rgba(4,12,22,0.9)] md:max-w-xs">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Búsqueda
              </span>
              <div className="relative">
                <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 rounded-2xl border-border/60 bg-background/80 pl-10 font-medium text-foreground placeholder:text-muted-foreground/70"
                  placeholder="Buscar cervezas"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="h-px bg-border/60" />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Estilo
              </span>
              <select
                className="h-11 w-full rounded-2xl border border-border/60 bg-background/80 px-4 text-sm font-medium text-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={selectedStyle}
                onChange={(event) => setSelectedStyle(event.target.value)}
              >
                <option value="">Todos</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-px bg-border/60" />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Precio máximo
              </span>
              <input
                aria-label="filtro-precio"
                className="price-range h-2 w-full cursor-pointer appearance-none rounded-full bg-border/60"
                max={12000}
                min={1500}
                step={500}
                type="range"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
              <span className="text-sm font-medium text-muted-foreground">
                Hasta ${maxPrice} MXN
              </span>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col gap-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-background/80 p-6 text-center text-sm text-muted-foreground">
                No encontramos productos con los filtros seleccionados.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
