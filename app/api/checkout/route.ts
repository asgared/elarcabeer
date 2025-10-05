import { NextResponse } from "next/server";

import { products } from "@/data/products";
import { defaultLocale, locales as supportedLocales } from "@/i18n/locales";
import { stripe } from "@/lib/stripe"; // <<<--- CORRECCIÓN #1: Se importa la constante 'stripe'
import type { Stripe } from "stripe"; // Se importa el tipo 'Stripe' directamente de la librería

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckoutRequest = {
  userId: string;
  items: { productId: string; variantId: string; quantity: number }[];
  currency?: string;
  customer?: { email?: string; name?: string | null };
  shippingAddress?: {
    label?: string;
    street?: string;
    city?: string;
    country?: string;
    postal?: string;
  };
  locale?: string;
};

type NormalizedCheckoutItem = {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  unitAmount: number;
};

type ValidatedCheckout = {
  items: Stripe.Checkout.SessionCreateParams.LineItem[];
  customerEmail: string;
  customerName?: string;
  shippingAddress: {
    label: string;
    street: string;
    city: string;
    country: string;
    postal: string;
  };
  currency: string;
  locale: string;
  origin: string;
  userId: string;
  normalizedItems: NormalizedCheckoutItem[];
};

function normalizeOrigin(request: Request) {
  const url = new URL(request.url);
  const originHeader = request.headers.get("origin");
  return originHeader ?? `${url.protocol}//${url.host}`;
}

function validateCheckoutPayload(
  payload: CheckoutRequest,
  request: Request
): ValidatedCheckout | NextResponse {
  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido." },
      { status: 400 }
    );
  }

  if (typeof payload.userId !== "string" || payload.userId.trim().length === 0) {
    return NextResponse.json(
      { error: "Falta el identificador del usuario." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  if (!payload.customer || typeof payload.customer.email !== "string") {
    return NextResponse.json(
      { error: "Falta el correo electrónico del cliente." },
      { status: 400 }
    );
  }

  const customerEmail = payload.customer.email.trim();

  if (!customerEmail) {
    return NextResponse.json(
      { error: "El correo electrónico del cliente es obligatorio." },
      { status: 400 }
    );
  }

  if (!payload.shippingAddress || typeof payload.shippingAddress !== "object") {
    return NextResponse.json(
      { error: "Falta la dirección de envío." },
      { status: 400 }
    );
  }

  const requiredAddressFields: (keyof NonNullable<
    CheckoutRequest["shippingAddress"]
  >)[] = ["label", "street", "city", "country", "postal"];

  const shippingAddress: ValidatedCheckout["shippingAddress"] = {
    label: "",
    street: "",
    city: "",
    country: "",
    postal: "",
  };

  for (const field of requiredAddressFields) {
    const value = payload.shippingAddress?.[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      return NextResponse.json(
        { error: `El campo "${field}" de la dirección es obligatorio.` },
        { status: 400 }
      );
    }

    shippingAddress[field] = value.trim();
  }

  const allowedLocales = [...supportedLocales] as string[];
  const locale =
    typeof payload.locale === "string" && allowedLocales.includes(payload.locale)
      ? payload.locale
      : defaultLocale;

  const origin = normalizeOrigin(request);

  const currency =
    typeof payload.currency === "string" && payload.currency.trim().length === 3
      ? payload.currency.trim().toLowerCase()
      : "mxn";

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const normalizedItems: NormalizedCheckoutItem[] = [];

  for (const entry of payload.items) {
    if (!entry || typeof entry !== "object") {
      return NextResponse.json(
        { error: "Formato de producto inválido." },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity } = entry;

    if (typeof productId !== "string" || typeof variantId !== "string") {
      return NextResponse.json(
        { error: "Faltan datos del producto." },
        { status: 400 }
      );
    }

    const numericQuantity = Number(quantity);

    if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      return NextResponse.json(
        { error: "Las cantidades deben ser mayores a cero." },
        { status: 400 }
      );
    }

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 400 });
    }

    const variant = product.variants.find((item) => item.id === variantId);

    if (!variant) {
      return NextResponse.json(
        { error: "Variante de producto no válida." },
        { status: 400 }
      );
    }

    const price = Number(variant.price);

    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json(
        { error: "El precio del producto es inválido." },
        { status: 400 }
      );
    }

    const imageUrl = product.heroImage
      ? new URL(product.heroImage, origin).toString()
      : undefined;

    const itemName = `${product.name} · ${variant.name}`;

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency,
        product_data: {
          name: itemName,
          metadata: {
            productId: product.id,
            variantId: variant.id,
          },
          ...(imageUrl ? { images: [imageUrl] } : {}),
        },
        unit_amount: price,
      },
      quantity: numericQuantity,
    };

    items.push(lineItem);
    normalizedItems.push({
      productId,
      variantId,
      name: itemName,
      quantity: numericQuantity,
      unitAmount: price,
    });
  }

  return {
    items,
    customerEmail,
    customerName:
      typeof payload.customer.name === "string" &&
      payload.customer.name.trim().length > 0
        ? payload.customer.name.trim()
        : undefined,
    shippingAddress,
    currency,
    locale,
    origin,
    userId: payload.userId.trim(),
    normalizedItems,
  } satisfies ValidatedCheckout;
}

export async function POST(request: Request) {
  let payload: CheckoutRequest;

  try {
    payload = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el cuerpo de la petición." },
      { status: 400 }
    );
  }

  const validationResult = validateCheckoutPayload(payload, request);

  if (validationResult instanceof NextResponse) {
    return validationResult;
  }

  const {
    items,
    customerEmail,
    customerName,
    shippingAddress,
    currency,
    locale,
    origin,
    userId,
    normalizedItems,
  } = validationResult;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items,
      customer_email: customerEmail,
      billing_address_collection: "auto",
      success_url: new URL(
        `/${locale}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        origin
      ).toString(),
      cancel_url: new URL(`/${locale}/checkout?status=cancelled`, origin).toString(),
      metadata: {
        ...(customerName ? { customer_name: customerName } : {}),
        shipping_label: shippingAddress.label,
        shipping_street: shippingAddress.street,
        shipping_city: shippingAddress.city,
        shipping_country: shippingAddress.country,
        shipping_postal: shippingAddress.postal,
        user_id: userId,
        currency_code: currency.toUpperCase(),
        cart_items: JSON.stringify(
          normalizedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            quantity: item.quantity,
            unitAmount: item.unitAmount,
          }))
        ),
        order_total: normalizedItems
          .reduce((total, item) => total + item.unitAmount * item.quantity, 0)
          .toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe checkout session", error);
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo iniciar el checkout con Stripe.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

