import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeApiVersion = process.env.STRIPE_API_VERSION;

if (!stripeSecretKey || !stripeApiVersion) {
  throw new Error("Stripe keys or API version not defined in environment variables.");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: stripeApiVersion as "2024-04-10",
  typescript: true,
});

