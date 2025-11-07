"use client";

import {motion} from "framer-motion";
import {FaCheck} from "react-icons/fa6";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

import {Variant} from "../../types/catalog";
import {useAnalyticsContext} from "../../providers/analytics-provider";
import {useCartDrawer} from "../../providers/cart-drawer-provider";
import {useCartStore} from "../../stores/cart-store";

interface Props {
  productId: string;
  variant: Variant;
}

const MotionButton = motion(Button);

export function AddToCartButton({productId, variant}: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) =>
    state.items.some(
      (item) => item.productId === productId && item.variant.id === variant.id
    )
  );
  const {open} = useCartDrawer();
  const analytics = useAnalyticsContext();

  return (
    <MotionButton
      onClick={() => {
        addItem(productId, variant);
        analytics.push({event: "add_to_cart", productId, variantId: variant.id});
        open();
      }}
      whileTap={{scale: 0.97}}
      whileHover={{y: -1}}
      className={cn(
        "flex items-center justify-center gap-2 bg-primary px-6 py-5 text-base font-semibold text-primary-foreground shadow-lg transition",
        "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isInCart && "bg-secondary-ocean text-foreground hover:bg-secondary-ocean/90"
      )}
    >
      {isInCart && <FaCheck className="h-4 w-4" />}
      {isInCart ? "En el carrito" : "Añadir al carrito"}
    </MotionButton>
  );
}
