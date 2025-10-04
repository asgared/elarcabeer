import {headers} from "next/headers";
import {NextResponse} from "next/server";
import type Stripe from "stripe";

import {prisma} from "@/lib/prisma";
import {createStripeClient} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MetadataCartItem = {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitAmount: number;
};

function parseCartItems(raw: string | null | undefined): MetadataCartItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MetadataCartItem[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        typeof item.variantId === "string" &&
        typeof item.name === "string" &&
        Number.isFinite(item.quantity) &&
        Number.isFinite(item.unitAmount)
    );
  } catch (error) {
    console.error("No se pudieron parsear los items del carrito desde el webhook", error);
    return [];
  }
}

function normalizeCartItems(items: MetadataCartItem[]) {
  return items
    .map((item) => {
      const quantity = Math.max(0, Math.trunc(item.quantity));
      const unitAmount = Number(item.unitAmount);

      if (!quantity || !Number.isFinite(unitAmount)) {
        return null;
      }

      return {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        quantity,
        unitAmount
      };
    })
    .filter((item): item is MetadataCartItem => item !== null);
}

export async function POST(request: Request) {
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return new NextResponse("Falta la firma de Stripe", {status: 400});
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET no está configurada");
  }

  const stripe = createStripeClient();

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Error validando webhook de Stripe", error);
    return new NextResponse("Firma inválida", {status: 400});
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};
    const userId = metadata.user_id;

    if (typeof userId !== "string" || userId.trim().length === 0) {
      console.error("El webhook de Stripe no incluye user_id en metadata");
      return NextResponse.json({received: true});
    }

    const existingPayment = await prisma.payment.findUnique({
      where: {stripeSessionId: session.id}
    });

    if (existingPayment) {
      return NextResponse.json({received: true});
    }

    const parsedItems = normalizeCartItems(parseCartItems(metadata.cart_items));

    if (parsedItems.length === 0) {
      console.error("No hay items válidos en el webhook de Stripe", metadata.cart_items);
      return NextResponse.json({received: true});
    }

    const metadataTotal = metadata.order_total ? Number(metadata.order_total) : undefined;
    const hasMetadataTotal =
      typeof metadataTotal === "number" && Number.isFinite(metadataTotal);
    const computedTotalCents = parsedItems.reduce(
      (total, item) => total + item.unitAmount * item.quantity,
      0
    );

    const amountTotalCents =
      typeof session.amount_total === "number"
        ? session.amount_total
        : hasMetadataTotal
        ? metadataTotal
        : computedTotalCents;

    const orderTotal = amountTotalCents / 100;
    const paymentStatus = session.payment_status ?? "paid";

    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            userId: userId.trim(),
            total: orderTotal,
            status: "COMPLETED",
            items: {
              create: parsedItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                quantity: item.quantity,
                price: item.unitAmount / 100
              }))
            },
            payment: {
              create: {
                stripeSessionId: session.id,
                amount: orderTotal,
                status: paymentStatus
              }
            }
          }
        });
      });
    } catch (error) {
      console.error("Error creando la orden desde Stripe", error);
      return new NextResponse("Error al crear la orden", {status: 500});
    }
  }

  return NextResponse.json({received: true});
}
