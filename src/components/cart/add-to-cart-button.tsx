"use client";

import {Button} from "@chakra-ui/react";

import {Variant} from "../../types/catalog";
import {useAnalyticsContext} from "../../providers/analytics-provider";
import {useCartDrawer} from "../../providers/cart-drawer-provider";
import {useCartStore} from "../../stores/cart-store";

interface Props {
  productId: string;
  variant: Variant;
}

export function AddToCartButton({productId, variant}: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const {open} = useCartDrawer();
  const analytics = useAnalyticsContext();

  return (
    <Button
      onClick={() => {
        addItem(productId, variant);
        analytics.push({event: "add_to_cart", productId, variantId: variant.id});
        open();
      }}
    >
      Añadir al carrito
    </Button>
  );
}
