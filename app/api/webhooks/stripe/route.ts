import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type CartItemMetadata = {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitAmount: number;
};

export async function POST(request: NextRequest) {
  console.log("[Webhook] Petición POST recibida.");
  const body = await request.text();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(`[Webhook] Firma verificada. Evento recibido: ${event.type}`);
  } catch (err: any) {
    console.error(`[Webhook] ❌ FALLO DE VALIDACIÓN DE FIRMA: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[Webhook] Procesando evento 'checkout.session.completed' para sesión: ${session.id}`);

    if (!session?.metadata?.user_id || !session?.metadata?.cart_items) {
      console.warn("[Webhook] ⚠️ ADVERTENCIA: Metadata 'user_id' o 'cart_items' faltante. Abortando.");
      return new NextResponse("Webhook Error: Metadata is missing", { status: 400 });
    }

    const userId = session.metadata.user_id;
    const cartItems = JSON.parse(session.metadata.cart_items) as CartItemMetadata[];
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

    console.log(`[Webhook] Datos extraídos: userId=${userId}, total=${totalAmount}, items=${cartItems.length}`);

    try {
      const dataToCreate = {
        userId: userId,
        total: totalAmount,
        status: "COMPLETED",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            quantity: item.quantity,
            price: item.unitAmount / 100,
          })),
        },
        payment: {
          create: {
            stripeSessionId: session.id,
            amount: totalAmount,
            status: session.payment_status,
          },
        },
      };

      console.log("[Webhook] Intentando ejecutar prisma.order.create() con los siguientes datos:", JSON.stringify(dataToCreate, null, 2));
      
      await prisma.order.create({ data: dataToCreate });

      console.log(`[Webhook] ✅ ÉXITO: Orden creada en la base de datos para el usuario: ${userId}`);

    } catch (err) {
      // ESTE ES EL LOG MÁS IMPORTANTE
      console.error("[Webhook] ❌ ERROR CATASTRÓFICO: La escritura en la base de datos falló.", err);
      return new NextResponse("Error interno del servidor al intentar crear la orden.", { status: 500 });
    }
  } else {
    console.log(`[Webhook] Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}