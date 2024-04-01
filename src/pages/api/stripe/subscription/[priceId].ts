import { type NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { getNewStripe } from '@/utils/stripe-client'

const handler: NextApiHandler = async (req, res) => {
  try {
    // Create authenticated Supabase Client
    const supabase = createPagesServerClient({ req, res })
    // Check if we have a session
    const {
      data: { session: supaSession },
    } = await supabase.auth.getSession()

    if (!supaSession) {
      res.status(401).json({
        error: 'not_authenticated',
        description: 'The user does not have an active session or is not authenticated',
      })
      return
    }

    // validate if exists a stripe_customer_id
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', supaSession.user.id)
      .single()

    let stripeCustomerId = customer?.stripe_customer_id ?? null

    const stripe = getNewStripe()

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: supaSession.user.email,
        description: supaSession.user.user_metadata.full_name,
      })

      await supabase.from('customers').insert([
        {
          id: supaSession.user.id,
          stripe_customer_id: customer.id,
        },
      ])

      stripeCustomerId = customer.id
    }

    // Create Stripe Checkout session
    const { priceId } = req.query

    const lineItems = [
      {
        price: priceId as string,
        quantity: 1,
      },
    ]

    const baseurl = process.env.NEXT_PUBLIC_BASE_URL as string
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseurl}/app/dashboard`,
      cancel_url: `${baseurl}/pricing`,
    })

    res.send({
      id: stripeSession.id,
    })
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

export default handler
