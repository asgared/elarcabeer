"use client";

import {cn} from "@/lib/utils";
import {useToastStore} from "@/stores/toast-store";

const STATUS_STYLES: Record<string, string> = {
  success: "border-accent/60 bg-accent/10 text-foreground",
  error: "border-danger/60 bg-danger/10 text-danger-foreground",
  warning: "border-warning/60 bg-warning/10 text-warning-foreground",
  info: "border-white/15 bg-muted text-foreground",
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-3 px-4 md:items-end md:px-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 shadow-soft",
            "backdrop-blur",
            STATUS_STYLES[toast.status ?? "info"] ?? STATUS_STYLES.info
          )}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-1">
              {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
              {toast.description ? (
                <p className="text-xs text-foreground/80">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xs font-medium text-foreground/60 transition hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
