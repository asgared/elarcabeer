"use client";

import {useCallback} from "react";

import type {ToastStatus} from "@/stores/toast-store";
import {useToastStore} from "@/stores/toast-store";

type ToastOptions = {
  title?: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
};

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return useCallback(
    (options: ToastOptions) => {
      addToast(options);
    },
    [addToast]
  );
}
