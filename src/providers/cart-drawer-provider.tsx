"use client";

import {ReactNode, createContext, useCallback, useContext, useMemo, useState} from "react";

import {CartDrawer} from "../components/cart/cart-drawer";

export type CartDrawerContextValue = {
  open: () => void;
  close: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function CartDrawerProvider({children}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      open,
      close
    }),
    [close, open]
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={close} />
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);

  if (!context) {
    throw new Error("useCartDrawer must be used inside CartDrawerProvider");
  }

  return context;
}
