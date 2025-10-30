"use client";

import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {useCartDrawer} from "@/providers/cart-drawer-provider";

export function CartContent() {
  const {open} = useCartDrawer();

  return (
    <Container className="max-w-3xl py-10 md:py-16">
      <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
        <h1 className="text-3xl font-semibold md:text-4xl">Tu carrito</h1>
        <p className="text-sm text-white/70 md:text-base">
          Gestiona los productos desde el panel lateral. Puedes abrirlo con el botón inferior.
        </p>
        <Button className="w-full sm:w-auto" onClick={open} size="lg">
          Abrir carrito
        </Button>
      </div>
    </Container>
  );
}
