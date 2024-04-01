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

    const stripeCustomerId = customer?.stripe_customer_id ?? null

    const stripe = getNewStripe()
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL as string

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseurl}/app/dashboard`,
    })

    res.send({
      url: session.url,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Something went wrong.' })
  }
}

export default handler
