import Stripe from "stripe";

const DEFAULT_STRIPE_API_VERSION: Stripe.LatestApiVersion = "2023-08-16";

function resolveApiVersion(
  apiVersion: string | undefined
): Stripe.LatestApiVersion {
  if (!apiVersion) {
    return DEFAULT_STRIPE_API_VERSION;
  }

  if (apiVersion === DEFAULT_STRIPE_API_VERSION) {
    return apiVersion;
  }

  throw new Error(
    `Stripe API version "${apiVersion}" no es compatible con el SDK instalado.`
  );
}

export function createStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY no está definida");
  }

  const apiVersion = resolveApiVersion(process.env.STRIPE_API_VERSION);

  return new Stripe(stripeSecretKey, {apiVersion});
}

export type {Stripe};
