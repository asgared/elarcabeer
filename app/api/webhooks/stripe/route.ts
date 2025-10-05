import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Define el tipo para los items del carrito que vienen en la metadata
// Asegúrate de que coincida con lo que envías desde checkout/route.ts
type CartItemMetadata = {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitAmount: number; // Stripe envía esto en centavos
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    // Verifica la firma del webhook para asegurar que la petición viene de Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Error de validación del webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Maneja el evento específico de checkout completado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1. VERIFICACIÓN CRUCIAL DE METADATA
    // Leemos 'user_id' (con guion bajo) porque así lo envía la API de checkout
    if (!session?.metadata?.user_id || !session?.metadata?.cart_items) {
      console.error("❌ Metadata 'user_id' o 'cart_items' faltante en la sesión de checkout.");
      // Devolvemos un error claro si falta la metadata
      return new NextResponse("Webhook Error: Metadata is missing", { status: 400 });
    }

    const userId = session.metadata.user_id;
    const cartItems = JSON.parse(session.metadata.cart_items) as CartItemMetadata[];

    try {
      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

      // 2. CREACIÓN DE LA ORDEN EN LA BASE DE DATOS
      // Se crea la orden, sus items y el pago en una sola transacción atómica
      await prisma.order.create({
        data: {
          userId: userId,
          total: totalAmount,
          status: "COMPLETED",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              quantity: item.quantity,
              price: item.unitAmount / 100, // Convertimos de centavos a la unidad principal (ej. pesos)
            })),
          },
          payment: {
            create: {
              stripeSessionId: session.id,
              amount: totalAmount,
              status: session.payment_status,
            },
          },
        },
      });
       console.log(`✅ Orden creada exitosamente para el usuario: ${userId}`);

    } catch (err) {
      console.error("❌ Error al crear la orden en la base de datos:", err);
      // Si la escritura en la DB falla, devolvemos un error 500 para que Stripe sepa que falló de nuestro lado
      return new NextResponse("Error del servidor al crear la orden.", { status: 500 });
    }
  } else {
    console.log(`Evento no manejado: ${event.type}`);
  }
  return NextResponse.json({ received: true });
}
