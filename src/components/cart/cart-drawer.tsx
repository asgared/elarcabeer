"use client";

import Link from "next/link";
import {useEffect, useState, type ReactNode} from "react";
import {createPortal} from "react-dom";
import {FaMinus, FaPlus, FaTrash} from "react-icons/fa6";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

import {useAnalyticsContext} from "../../providers/analytics-provider";
import {products} from "../../data/products";
import {selectCartTotal, useCartStore} from "../../stores/cart-store";
import {formatCurrency} from "../../utils/currency";

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

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
      />
      <aside
        className="relative ml-auto flex h-full w-full max-w-full flex-col bg-background p-6 shadow-card transition md:max-w-md"
      >
        <header className="border-b border-white/10 pb-4 text-lg font-semibold">Tu Carrito</header>
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-6">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tu carrito está vacío por ahora.</p>
            ) : (
              items.map((item) => {
                const product = products.find((productItem) => productItem.id === item.productId);

                if (!product) return null;

                return (
                  <div
                    key={`${item.productId}-${item.variant.id}`}
                    className="border-b border-white/5 pb-4 last:border-b-0"
                  >
                    <p className="text-lg font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <QuantityButton
                        icon={<FaMinus className="h-3.5 w-3.5" />}
                        ariaLabel="Disminuir"
                        onClick={() =>
                          updateQuantity(item.productId, item.variant.id, item.quantity - 1)
                        }
                      />
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <QuantityButton
                        icon={<FaPlus className="h-3.5 w-3.5" />}
                        ariaLabel="Incrementar"
                        onClick={() =>
                          updateQuantity(item.productId, item.variant.id, item.quantity + 1)
                        }
                      />
                      <QuantityButton
                        icon={<FaTrash className="h-3.5 w-3.5" />}
                        ariaLabel="Eliminar"
                        variant="destructive"
                        onClick={() => removeItem(item.productId, item.variant.id)}
                      />
                    </div>
                    <p className="mt-2 text-base font-semibold">
                      {formatCurrency(item.variant.price * item.quantity, currency)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <footer className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total, currency)}</span>
          </div>
          <div className="space-y-3">
            <Button
              asChild
              onClick={() => {
                analytics.push({event: "begin_checkout", value: total});
                onClose();
              }}
            >
              <Link href="/checkout">Ir a checkout</Link>
            </Button>
            <Button variant="outline" onClick={() => clear()}>
              Vaciar carrito
            </Button>
          </div>
        </footer>
      </aside>
    </div>,
    document.body
  );
}

type QuantityButtonProps = {
  icon: ReactNode;
  ariaLabel: string;
  onClick: () => void;
  variant?: "default" | "destructive";
};

function QuantityButton({icon, ariaLabel, onClick, variant = "default"}: QuantityButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-sm transition",
        "hover:border-accent hover:bg-accent/10",
        variant === "destructive"
          ? "border-danger/60 text-danger hover:bg-danger/10"
          : "text-foreground"
      )}
    >
      {icon}
    </button>
  );
}
