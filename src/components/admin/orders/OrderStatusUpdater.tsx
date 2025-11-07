"use client";

import {useCallback, useState, useTransition} from "react";
import {motion} from "framer-motion";
import type {OrderStatus} from "@prisma/client";

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {updateOrderStatus} from "@/app/api/admin/orders/actions";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  SHIPPED: "Enviada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-warning text-warning-foreground",
  PROCESSING: "bg-info text-info-foreground",
  SHIPPED: "bg-info text-info-foreground",
  COMPLETED: "bg-success text-success-foreground",
  CANCELLED: "bg-danger text-danger-foreground",
};

const ORDER_STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

type OrderStatusUpdaterProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusUpdater({orderId, currentStatus}: OrderStatusUpdaterProps) {
  const toast = useToast();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = useCallback(
    (nextStatus: OrderStatus) => {
      if (nextStatus === status) {
        return;
      }

      const previousStatus = status;

      startTransition(() => {
        setStatus(nextStatus);

        updateOrderStatus(orderId, nextStatus)
          .then((result) => {
            if (!result.success) {
              setStatus(previousStatus);
              toast({
                title: "No se pudo actualizar el estado",
                description: result.message,
                status: "error",
              });
              return;
            }

            toast({
              title: "Estado actualizado",
              description: result.message,
              status: "success",
            });
          })
          .catch(() => {
            setStatus(previousStatus);
            toast({
              title: "Error inesperado",
              description: "No se pudo actualizar el estado de la orden.",
              status: "error",
            });
          });
      });
    },
    [orderId, status, toast, startTransition]
  );

  return (
    <Select value={status} onValueChange={(value) => handleStatusChange(value as OrderStatus)} disabled={isPending}>
      <SelectTrigger
        className={cn(
          "relative flex min-w-[12rem] items-center gap-2 rounded-lg border-0 px-4 py-2 text-left font-semibold shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0",
          STATUS_COLORS[status],
          isPending && "opacity-80"
        )}
      >
        <SelectValue placeholder="Selecciona un estado" />
        {isPending ? (
          <motion.span
            className="pointer-events-none absolute right-3 flex h-4 w-4 items-center justify-center"
            animate={{rotate: 360}}
            transition={{repeat: Infinity, duration: 0.8, ease: "linear"}}
          >
            <span className="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent" />
          </motion.span>
        ) : null}
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
