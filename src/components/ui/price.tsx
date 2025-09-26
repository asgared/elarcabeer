"use client";

import {Text, TextProps} from "@chakra-ui/react";
import {formatCurrency} from "@/utils/currency";
import {useCartStore} from "@/stores/cart-store";

type PriceProps = TextProps & {
  amount: number;
  currency?: string;     // <- opcional: permite override desde el llamador
  locale?: string;       // <- opcional por si luego quieres forzar locale
};

export function Price({amount, currency, locale, ...props}: PriceProps) {
  const storeCurrency = useCartStore((s) => s.currency);
  const cur = currency ?? storeCurrency ?? process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "MXN";

  return (
    <Text fontWeight="semibold" {...props}>
      {formatCurrency(amount, cur, locale)}
    </Text>
  );
}
