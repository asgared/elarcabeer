import Stripe from 'stripe'
import { loadStripe, type Stripe as TypeStripe } from '@stripe/stripe-js'

let stripePromise: Promise<TypeStripe | null>

export const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
    )
  }

  return await stripePromise
}

export const getNewStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}
