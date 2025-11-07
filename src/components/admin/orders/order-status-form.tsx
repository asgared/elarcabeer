"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import type {OrderStatus} from "@prisma/client";

import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useToast} from "@/hooks/use-toast";

const ORDER_STATUS_OPTIONS = [
  {value: "PENDING", label: "Pendiente"},
  {value: "PROCESSING", label: "Procesando"},
  {value: "SHIPPED", label: "Enviada"},
  {value: "COMPLETED", label: "Completada"},
  {value: "CANCELLED", label: "Cancelada"},
] as const;

type OrderStatusFormProps = {
  orderId: string;
  initialStatus: OrderStatus;
};

export function OrderStatusForm({orderId, initialStatus}: OrderStatusFormProps) {
  const router = useRouter();
  const toast = useToast();
  const normalizedInitialStatus = initialStatus;
  const [status, setStatus] = useState<OrderStatus>(normalizedInitialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = status !== normalizedInitialStatus;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!status || !hasChanges) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({status}),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          typeof errorBody?.error === "string"
            ? errorBody.error
            : "No se pudo actualizar el estado de la orden.";

        throw new Error(message);
      }

      toast({title: "Estado actualizado", status: "success"});
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el estado de la orden.";

      toast({
        title: "Error al actualizar",
        description: message,
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
        <SelectTrigger className="w-full sm:w-60">
          <SelectValue placeholder="Selecciona un estado" />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isSubmitting || !hasChanges}>
        {isSubmitting ? "Guardando..." : "Actualizar estado"}
      </Button>
    </form>
  );
}
