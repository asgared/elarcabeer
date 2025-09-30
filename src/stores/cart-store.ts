import {useSyncExternalStore} from "react";

import type {Variant} from "../types/catalog";

type CartItem = {
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

export type CartStore = CartState & CartActions;

const STORAGE_KEY = "elarca-cart";
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "MXN";

let state: CartState = {
  items: [],
  currency: DEFAULT_CURRENCY
};

const listeners = new Set<() => void>();

const store: CartStore = {
  ...state,
  addItem(productId, variant) {
    updateState((current) => {
      const existing = current.items.find(
        (item) => item.productId === productId && item.variant.id === variant.id
      );

      if (existing) {
        return {
          ...current,
          items: current.items.map((item) =>
            item.productId === productId && item.variant.id === variant.id
              ? {...item, quantity: item.quantity + 1}
              : item
          )
        };
      }

      return {
        ...current,
        items: [...current.items, {productId, variant, quantity: 1}]
      };
    });
  },
  removeItem(productId, variantId) {
    updateState((current) => ({
      ...current,
      items: current.items.filter(
        (item) => !(item.productId === productId && item.variant.id === variantId)
      )
    }));
  },
  updateQuantity(productId, variantId, quantity) {
    updateState((current) => {
      if (quantity <= 0) {
        return {
          ...current,
          items: current.items.filter(
            (item) => !(item.productId === productId && item.variant.id === variantId)
          )
        };
      }

      return {
        ...current,
        items: current.items.map((item) =>
          item.productId === productId && item.variant.id === variantId
            ? {...item, quantity}
            : item
        )
      };
    });
  },
  clear() {
    updateState((current) => ({...current, items: []}));
  },
  setCurrency(currency) {
    updateState((current) => ({...current, currency}));
  }
};

function notifySubscribers() {
  listeners.forEach((listener) => listener());
}

function persist(nextState: CartState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items: nextState.items,
        currency: nextState.currency
      })
    );
  } catch (error) {
    console.warn("No se pudo persistir el carrito", error);
  }
}

function updateStore(nextState: CartState) {
  state = nextState;
  store.items = state.items;
  store.currency = state.currency;
}

function updateState(recipe: (current: CartState) => CartState) {
  const nextState = recipe(state);
  updateStore(nextState);
  persist(nextState);
  notifySubscribers();
}

let hasHydrated = false;

function hydrate() {
  if (hasHydrated || typeof window === "undefined") {
    return;
  }

  hasHydrated = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Partial<CartState>;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const currency = typeof parsed.currency === "string" ? parsed.currency : DEFAULT_CURRENCY;

    updateStore({items, currency});
    notifySubscribers();
  } catch (error) {
    console.warn("No se pudo hidratar el carrito", error);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartStore {
  hydrate();
  return store;
}

export function useCartStore(): CartStore;
export function useCartStore<T>(selector: (store: CartStore) => T): T;
export function useCartStore<T>(selector?: (store: CartStore) => T) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (selector) {
    return selector(snapshot);
  }

  return snapshot as unknown as T;
}

export const selectCartCount = (snapshot: Pick<CartStore, "items">) =>
  snapshot.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (snapshot: Pick<CartStore, "items">) =>
  snapshot.items.reduce((total, item) => total + item.variant.price * item.quantity, 0);

export type {CartItem};
