import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";

import {Variant} from "../types/catalog";

export type CartItem = {
  productId: string;
  variant: Variant;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  currency: string;
};

type CartActions = {
  addItem: (productId: string, variant: Variant) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clear: () => void;
  setCurrency: (currency: string) => void;
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "MXN",
      addItem: (productId, variant) => {
        const existing = get().items.find(
          (item) => item.productId === productId && item.variant.id === variant.id
        );

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.productId === productId && item.variant.id === variant.id
                ? {...item, quantity: item.quantity + 1}
                : item
            )
          });
        } else {
          set({
            items: [...get().items, {productId, variant, quantity: 1}]
          });
        }
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variant.id === variantId)
          )
        });
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter(
              (item) => !(item.productId === productId && item.variant.id === variantId)
            )
          });
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId && item.variant.id === variantId
              ? {...item, quantity}
              : item
          )
        });
      },
      clear: () => set({items: []}),
      setCurrency: (currency) => set({currency})
    }),
    {
      name: "elarca-cart",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((acc, item) => acc + item.quantity, 0);

export const selectCartTotal = (state: CartState) =>
  state.items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
