import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

type CheckoutMetadata = {
  user_id?: string | null;
  currency_code?: string | null;
  shipping_label?: string | null;
  shipping_street?: string | null;
  shipping_city?: string | null;
  shipping_country?: string | null;
  shipping_postal?: string | null;
  cart_items?: string | null;
  order_total?: string | null;
};

type MetadataCartItem = {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitAmount: number;
};

function parseCartItems(rawItems: string | null | undefined): MetadataCartItem[] {
  if (!rawItems) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawItems) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized: MetadataCartItem[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const { productId, variantId, name, quantity, unitAmount } = item as Record<string, unknown>;

      if (
        typeof productId !== "string" ||
        typeof variantId !== "string" ||
        typeof name !== "string"
      ) {
        continue;
      }

      const numericQuantity = Number(quantity);
      const numericAmount = Number(unitAmount);

      if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        continue;
      }

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        continue;
      }

      normalized.push({
        productId,
        variantId,
        name,
        quantity: Math.trunc(numericQuantity),
        unitAmount: Math.round(numericAmount),
      });
    }

    return normalized;
  } catch (error) {
    console.error("[webhooks/stripe] No se pudo interpretar los artículos del carrito.", error);
    return [];
  }
}

function parseAmount(value: string | number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.trim());

    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;

  const stripeClient = getStripeClient();

  if (!stripeClient) {
    console.error("[webhooks/stripe] Stripe no está configurado en el entorno actual.");
    return new NextResponse("Stripe no configurado", { status: 500 });
  }

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (error) {
    console.error("[webhooks/stripe] Falló la verificación de firma del webhook.", error);
    return new NextResponse("Webhook Error: Firma inválida", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    console.error(
        "[webhooks/stripe] Stripe webhook recibido checkout.session.completed 1."
      );
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = (session.metadata ?? {}) as CheckoutMetadata;

    const userId = metadata.user_id?.trim();

    if (!userId) {
      console.error(
        "[webhooks/stripe] La sesión %s no incluye el identificador del usuario.",
        session.id
      );
      return NextResponse.json({ received: true });
    }

    const items = parseCartItems(metadata.cart_items);

    if (items.length === 0) {
      console.error(
        "[webhooks/stripe] La sesión %s no contiene artículos válidos en la metadata.",
        session.id
      );
      return NextResponse.json({ received: true });
    }

    const totalFromMetadata = parseAmount(metadata.order_total);
    const total =
      totalFromMetadata ??
      (typeof session.amount_total === "number" ? Math.round(session.amount_total) : null);

    if (total === null) {
      console.error(
        "[webhooks/stripe] La sesión %s no incluye un monto total válido.",
        session.id
      );
      return NextResponse.json({ received: true });
    }

    try {
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeSessionId: session.id },
        select: { id: true },
      });

      if (existingPayment) {
        console.info(
          "[webhooks/stripe] La sesión %s ya había sido procesada anteriormente.",
          session.id
        );
        return NextResponse.json({ received: true });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        console.error(
          "[webhooks/stripe] No se encontró el usuario %s asociado a la sesión %s.",
          userId,
          session.id
        );
        return NextResponse.json({ received: true });
      }

      const paymentStatus = (() => {
        switch (session.payment_status) {
          case "paid":
          case "no_payment_required":
            return "paid";
          case "unpaid":
            return "pending";
          default:
            return "pending";
        }
      })();

      await prisma.order.create({
        data: {
          userId,
          total,
          status: "processing",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              quantity: item.quantity,
              price: item.unitAmount,
            })),
          },
          payment: {
            create: {
              stripeSessionId: session.id,
              amount: total,
              status: paymentStatus,
            },
          },
        },
      });
    } catch (error) {
      console.error(
        "[webhooks/stripe] Error al crear la orden para la sesión %s.",
        session.id,
        error
      );
      return new NextResponse("Webhook Error: No se pudo registrar la orden", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

