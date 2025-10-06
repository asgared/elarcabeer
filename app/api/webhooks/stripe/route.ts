import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  console.log("[PRUEBA] Webhook recibido.");
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
    console.error(`[PRUEBA] ❌ FALLO DE FIRMA: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    console.log("[PRUEBA] Evento 'checkout.session.completed' detectado.");
    const session = event.data.object as Stripe.Checkout.Session;

    // A diferencia del código anterior, NO dependemos de la metadata por ahora.
    // Usaremos un userId de prueba. Asegúrate de que este ID de usuario exista en tu tabla 'User'.
    // Puedes obtener uno de tu tabla 'User' en Supabase.
    const testUserId = "cmg7kxh5i0000128u00ziypv5"; // REEMPLAZA CON UN ID DE USUARIO VÁLIDO DE TU DB

    try {
      console.log(`[PRUEBA] Intentando crear una orden de prueba para el usuario: ${testUserId}`);
      
      await prisma.order.create({
        data: {
          userId: testUserId,
          total: 99.99, // Valor de prueba
          status: "TEST_SUCCESS",
          items: {
            create: [
              {
                productId: "test-product",
                variantId: "test-variant",
                name: "Producto de Prueba",
                quantity: 1,
                price: 99.99,
              },
            ],
          },
          payment: {
            create: {
              stripeSessionId: session.id,
              amount: 99.99,
              status: "paid",
            },
          },
        },
      });

      console.log(`[PRUEBA] ✅ ÉXITO: La orden de prueba fue creada en la base de datos.`);

    } catch (err) {
      console.error("[PRUEBA] ❌ ERROR CATASTRÓFICO AL ESCRIBIR EN DB:", err);
      return new NextResponse("Error interno al crear la orden de prueba.", { status: 500 });
    }
  } else {
    console.log(`[PRUEBA] Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

