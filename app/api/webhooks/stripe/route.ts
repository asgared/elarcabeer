import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
    console.error(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session?.metadata?.userId || !session?.metadata?.cartItems) {
        console.error("❌ Metadata is missing from the checkout session.");
        return new NextResponse("Webhook Error: Metadata is missing", { status: 400 });
      }

      const userId = session.metadata.userId;
      const cartItems = JSON.parse(session.metadata.cartItems);

      try {
        const amount = session.amount_total ? session.amount_total / 100 : 0;

        await prisma.order.create({
          data: {
            userId: userId,
            total: amount,
            status: "COMPLETED",
            items: {
              create: cartItems.map((item: any) => ({
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
        console.error("❌ Error creating order in database:", err);
        // Do not return a 400 to Stripe, as it will keep retrying.
        // Log the error for monitoring.
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
