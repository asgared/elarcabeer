"use client";

import * as React from "react";

import {cn} from "@/lib/utils";
import {formatCurrency} from "@/utils/currency";
import {useCartStore} from "@/stores/cart-store";

type PriceProps = React.HTMLAttributes<HTMLSpanElement> & {
  amount: number;
  currency?: string; // <- opcional: permite override desde el llamador
  locale?: string; // <- opcional por si luego quieres forzar locale
};

export function Price({amount, currency, locale, className, ...props}: PriceProps) {
  const storeCurrency = useCartStore((s) => s.currency);
  const cur = currency ?? storeCurrency ?? process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "MXN";

  return (
    <span className={cn("font-semibold", className)} {...props}>
      {formatCurrency(amount, cur, locale)}
    </span>
  );
}
