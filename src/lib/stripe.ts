import Stripe from "stripe";

let stripeClient: Stripe | null = null;
let stripeInitializationAttempted = false;

export function getStripeClient(): Stripe | null {
  if (stripeClient) {
    return stripeClient;
  }

  if (stripeInitializationAttempted) {
    return null;
  }

  stripeInitializationAttempted = true;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeApiVersion = process.env.STRIPE_API_VERSION;

  if (!stripeSecretKey || !stripeApiVersion) {
    console.warn(
      "[stripe] Las variables STRIPE_SECRET_KEY o STRIPE_API_VERSION no están configuradas."
    );
    return null;
  }

  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: stripeApiVersion as Stripe.LatestApiVersion,
    typescript: true,
  });

  return stripeClient;
}
