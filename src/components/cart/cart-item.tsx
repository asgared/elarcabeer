"use client";

import Image from "next/image";
import {type ReactNode} from "react";
import {FaMinus, FaPlus, FaTrash} from "react-icons/fa6";

import {cn} from "@/lib/utils";
import {formatCurrency} from "@/utils/currency";

import type {Product} from "@/types/catalog";
import type {CartItem as CartEntry} from "@/stores/cart-store";

type QuantityButtonProps = {
  icon: ReactNode;
  ariaLabel: string;
  onClick: () => void;
};

function QuantityButton({icon, ariaLabel, onClick}: QuantityButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-secondary-ocean/30 bg-card text-sm text-secondary-ocean transition hover:border-secondary-ocean/50 hover:bg-secondary-ocean/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-ocean/60 focus-visible:ring-offset-2"
      )}
    >
      {icon}
    </button>
  );
}

type CartItemProps = {
  item: CartEntry;
  product: Product;
  currency: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export function CartItem({
  item,
  product,
  currency,
  onIncrease,
  onDecrease,
  onRemove
}: CartItemProps) {
  return (
    <article className="group grid grid-cols-[92px_1fr] gap-4 rounded-2xl border border-secondary-ocean/20 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-secondary-ocean/40">
      <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-secondary-ocean/20 bg-secondary-ocean/10">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="96px"
          className="object-contain"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{product.name}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-ocean">
              {item.variant.name}
            </p>
          </div>
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(item.variant.price * item.quantity, currency)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 rounded-full border border-secondary-ocean/20 bg-card px-3 py-1.5">
            <QuantityButton
              icon={<FaMinus className="h-3.5 w-3.5" />}
              ariaLabel="Disminuir cantidad"
              onClick={onDecrease}
            />
            <span className="text-sm font-semibold text-foreground">{item.quantity}</span>
            <QuantityButton
              icon={<FaPlus className="h-3.5 w-3.5" />}
              ariaLabel="Incrementar cantidad"
              onClick={onIncrease}
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-danger transition hover:text-danger/80"
          >
            <FaTrash className="h-3.5 w-3.5" />
            Quitar
          </button>
        </div>
      </div>
    </article>
  );
}
