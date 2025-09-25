"use client";

import {Text, TextProps} from "@chakra-ui/react";

import {formatCurrency} from "../../utils/currency";
import {useCartStore} from "../../stores/cart-store";

export function Price({amount, ...props}: TextProps & {amount: number}) {
  const currency = useCartStore((state) => state.currency);

  return (
    <Text fontWeight="semibold" {...props}>
      {formatCurrency(amount, currency)}
    </Text>
  );
}
