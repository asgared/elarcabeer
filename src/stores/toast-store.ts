"use client";

import {create} from "zustand";

export type ToastStatus = "success" | "error" | "warning" | "info";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
};

type ToastStore = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
};

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: ({duration = 5000, ...toast}) => {
    const id = generateId();

    set((state) => ({
      toasts: [...state.toasts, {id, duration, ...toast}],
    }));

    if (duration && duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((item) => item.id !== id),
        }));
      }, duration);
    }

    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
