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
};

type MetadataCartItem = {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
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

      const { productId, variantId, name, quantity } = item as Record<string, unknown>;

      if (
        typeof productId !== "string" ||
        typeof variantId !== "string" ||
        typeof name !== "string"
      ) {
        continue;
      }

      const numericQuantity = Number(quantity);

      if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        continue;
      }

      normalized.push({
        productId,
        variantId,
        name,
        quantity: Math.trunc(numericQuantity),
      });
    }

    return normalized;
  } catch (error) {
    console.error("[webhooks/stripe] No se pudo interpretar los artículos del carrito.", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeWebhookSecret) {
    console.error(
      "[webhooks/stripe] STRIPE_WEBHOOK_SECRET no está configurado. Rechazando webhook."
    );
    return new NextResponse("Webhook Error: Secret no configurado", { status: 500 });
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature") ?? "";

  let event: Stripe.Event;

  const stripeClient = getStripeClient();

  if (!stripeClient) {
    console.error("[webhooks/stripe] Stripe no está configurado en el entorno actual.");
    return new NextResponse("Stripe no configurado", { status: 500 });
  }

  try {
    event = stripeClient.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("[webhooks/stripe] Falló la verificación de firma del webhook.", error);
    return new NextResponse("Webhook Error: Firma inválida", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
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

    // --- Idempotency check ---
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

    // --- Parse cart identity from metadata (NO prices from metadata) ---
    const cartItems = parseCartItems(metadata.cart_items);

    if (cartItems.length === 0) {
      console.error(
        "[webhooks/stripe] La sesión %s no contiene artículos válidos en la metadata.",
        session.id
      );
      return NextResponse.json({ received: true });
    }

    // --- Fetch actual line items from Stripe (trusted source of charged amounts) ---
    let stripeLineItems: Stripe.ApiList<Stripe.LineItem>;

    try {
      stripeLineItems = await stripeClient.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });
    } catch (error) {
      console.error(
        "[webhooks/stripe] No se pudieron obtener los line_items de Stripe para la sesión %s.",
        session.id,
        error
      );
      return new NextResponse("Webhook Error: No se pudieron obtener line_items", { status: 500 });
    }

    // --- Fetch canonical prices from DB for each variant ---
    const variantIds = cartItems.map((item) => item.variantId);
    const dbVariants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true, stock: true },
    });

    const variantPriceMap = new Map(dbVariants.map((v) => [v.id, v.price]));

    // --- Build order items using DB prices ---
    let calculatedTotal = 0;
    const orderItems: {
      productId: string;
      variantId: string;
      name: string;
      quantity: number;
      price: number;
    }[] = [];

    let hasMissingVariant = false;

    for (const item of cartItems) {
      const dbPrice = variantPriceMap.get(item.variantId);

      if (dbPrice === undefined) {
        console.warn(
          "[webhooks/stripe] Variante %s no encontrada en DB para sesión %s.",
          item.variantId,
          session.id
        );
        hasMissingVariant = true;
        // Use Stripe line item amount as fallback — still flag for review
        const stripeLine = stripeLineItems.data.find((li) => {
          const meta = li.price?.product;
          if (typeof meta === "object" && meta !== null && "metadata" in meta) {
            return (meta as Stripe.Product).metadata?.variantId === item.variantId;
          }
          return false;
        });
        const fallbackPrice = stripeLine?.amount_total
          ? Math.round(stripeLine.amount_total / (stripeLine.quantity ?? 1))
          : 0;

        orderItems.push({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          quantity: item.quantity,
          price: fallbackPrice,
        });
        calculatedTotal += fallbackPrice * item.quantity;
        continue;
      }

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        quantity: item.quantity,
        price: dbPrice,
      });
      calculatedTotal += dbPrice * item.quantity;
    }

    // --- Cross-validate total against session.amount_total ---
    const stripeTotal =
      typeof session.amount_total === "number" ? Math.round(session.amount_total) : null;

    const totalMismatch = stripeTotal !== null && stripeTotal !== calculatedTotal;

    if (totalMismatch) {
      console.warn(
        "[webhooks/stripe] Mismatch de total para sesión %s: DB calculó %d, Stripe cobró %d.",
        session.id,
        calculatedTotal,
        stripeTotal
      );
    }

    // --- Determine order status ---
    const needsReview = totalMismatch || hasMissingVariant;
    const orderStatus = needsReview ? "needs_review" : "processing";

    if (needsReview) {
      console.warn(
        "[webhooks/stripe] Orden de sesión %s marcada como needs_review.",
        session.id
      );
    }

    // --- Verify user exists ---
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

    // --- Determine payment status ---
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

    // Use Stripe's amount_total as the canonical order total (what was actually charged)
    const orderTotal = stripeTotal ?? calculatedTotal;

    try {
      await prisma.order.create({
        data: {
          userId,
          total: orderTotal,
          status: orderStatus,
          items: {
            create: orderItems.map((item) => ({
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
              amount: orderTotal,
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
