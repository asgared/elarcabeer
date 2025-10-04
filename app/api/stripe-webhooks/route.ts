import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
type CartItem = {
    productId: string;
    variantId: string;
    name: string;
    quantity: number;
    price: number;
};


export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Error de validación del webhook: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session?.metadata?.user_id || !session?.metadata?.cart_items) {
        console.error("❌ Metadata (user_id o cart_items) faltante en la sesión de checkout.");
        return new NextResponse("Webhook Error: Metadata is missing", { status: 400 });
      }

      const userId = session.metadata.user_id;
      const cartItems = JSON.parse(session.metadata.cart_items) as CartItem[];

      try {
        const amount = session.amount_total ? session.amount_total / 100 : 0;

        await prisma.order.create({
          data: {
            userId: userId,
            total: amount,
            status: "COMPLETED",
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                quantity: item.quantity,
                price: item.price, 
              })),
            },
            payment: {
              create: {
                stripeSessionId: session.id,
                amount: amount,
                status: session.payment_status,
              },
            },
          },
        });
      } catch (err) {
        console.error("❌ Error al crear la orden en la base de datos:", err);

        return new NextResponse("Error del servidor al crear la orden.", { status: 500 });
      }
      break;
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
