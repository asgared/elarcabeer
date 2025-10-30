"use client";

import {useEffect} from "react";
import NextLink from "next/link";
import {useSearchParams} from "next/navigation";

import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {useCartStore} from "@/stores/cart-store";

export default function SuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Container maxW="4xl" py={{base: 16, md: 24}}>
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-3xl font-semibold md:text-4xl">¡Gracias por tu compra!</h1>
        <p className="text-lg text-white/70">
          Tu pago se ha procesado correctamente y estamos preparando tu pedido.
        </p>
        {sessionId ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Número de confirmación</p>
            <p className="mt-1 break-all text-lg font-semibold text-white">
              {sessionId}
            </p>
          </div>
        ) : null}
        <Button asChild size="lg">
          <NextLink href="/shop">Seguir explorando cervezas</NextLink>
        </Button>
      </div>
    </Container>
  );
}