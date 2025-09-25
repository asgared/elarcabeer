"use client";

import {useDisclosure} from "@chakra-ui/react";
import {ReactNode, createContext, useContext, useMemo} from "react";

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
  const disclosure = useDisclosure();

  const value = useMemo(
    () => ({
      open: disclosure.onOpen,
      close: disclosure.onClose
    }),
    [disclosure.onClose, disclosure.onOpen]
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
      <CartDrawer isOpen={disclosure.isOpen} onClose={disclosure.onClose} />
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
