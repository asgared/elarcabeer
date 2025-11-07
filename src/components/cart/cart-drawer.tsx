"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {AnimatePresence, motion} from "framer-motion";

import {Button} from "@/components/ui/button";

import {useAnalyticsContext} from "../../providers/analytics-provider";
import {products} from "../../data/products";
import {selectCartTotal, useCartStore} from "../../stores/cart-store";
import {formatCurrency} from "../../utils/currency";

import {CartItem} from "./cart-item";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartDrawer({isOpen, onClose}: Props) {
  const {items, removeItem, updateQuantity, clear, currency} = useCartStore();
  const total = useCartStore(selectCartTotal);
  const analytics = useAnalyticsContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.2, ease: "easeInOut"}}
        >
          <motion.button
            type="button"
            aria-label="Cerrar carrito"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-black/70"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.25, ease: "easeInOut"}}
          />
          <motion.aside
            className="relative ml-auto flex h-full w-full max-w-full flex-col border-l border-border/60 bg-card/95 text-foreground shadow-[0_35px_75px_-45px_rgba(3,10,20,0.85)] md:max-w-lg"
            initial={{x: "100%"}}
            animate={{x: 0}}
            exit={{x: "100%"}}
            transition={{type: "spring", stiffness: 260, damping: 30}}
          >
            <div className="flex h-full flex-col">
              <header className="border-b border-border/60 bg-background/70 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                      Resumen de compra
                    </p>
                    <h2 className="mt-1 text-xl font-bold">Tu carrito</h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    Cerrar
                  </button>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="rounded-xl border border-border/60 bg-background/80 p-6 text-sm text-muted-foreground">
                      Tu carrito está vacío por ahora.
                    </p>
                  ) : (
                    items.map((item) => {
                      const product = products.find(
                        (productItem) => productItem.id === item.productId
                      );

                      if (!product) return null;

                      return (
                        <CartItem
                          key={`${item.productId}-${item.variant.id}`}
                          item={item}
                          product={product}
                          currency={currency}
                          onDecrease={() =>
                            updateQuantity(
                              item.productId,
                              item.variant.id,
                              item.quantity - 1
                            )
                          }
                          onIncrease={() =>
                            updateQuantity(
                              item.productId,
                              item.variant.id,
                              item.quantity + 1
                            )
                          }
                          onRemove={() => removeItem(item.productId, item.variant.id)}
                        />
                      );
                    })
                  )}
                </div>
              </div>
              <footer className="border-t border-border/60 bg-background/80 px-6 py-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <Button
                    asChild
                    className="w-full rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => {
                      analytics.push({event: "begin_checkout", value: total});
                      onClose();
                    }}
                  >
                    <Link href="/checkout">Ir a checkout</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-border/60 text-muted-foreground hover:bg-background/70 hover:text-foreground"
                    onClick={() => clear()}
                  >
                    Vaciar carrito
                  </Button>
                </div>
              </footer>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
