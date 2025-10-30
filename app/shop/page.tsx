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
    <Container maxW="7xl">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold md:text-4xl">Shop</h1>
          <p className="text-white/70">Filtra por estilo y precio para encontrar tu tesoro líquido.</p>
        </div>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="flex w-full flex-shrink-0 flex-col gap-6 rounded-2xl border border-white/10 bg-[rgba(19,58,67,0.65)] p-6 md:max-w-xs">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-white">Búsqueda</span>
              <div className="relative">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  className="pl-9"
                  placeholder="Buscar cervezas"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-white">Estilo</span>
              <select
                className="h-10 w-full rounded-md border border-white/15 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
            <div className="h-px bg-white/10" />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-white">Precio máximo</span>
              <input
                aria-label="filtro-precio"
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
                max={12000}
                min={1500}
                step={500}
                type="range"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
              <span className="text-sm text-white/60">Hasta ${maxPrice} MXN</span>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col gap-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-background/40 p-6 text-center text-sm text-white/70">
                No encontramos productos con los filtros seleccionados.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
