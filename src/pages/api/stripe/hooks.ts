import { type NextApiHandler } from 'next'
import { buffer } from 'micro'

import { getServiceSupabase } from '@/utils/supabase-client'
import { getNewStripe } from '@/utils/stripe-client'

export const config = { api: { bodyParser: false } }

const handler: NextApiHandler = async (req, res) => {
  const requestBuffer = await buffer(req)
  const signature = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_SIGING_SECRET as string

  const stripe = getNewStripe()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(requestBuffer.toString(), signature, webhookSecret)

    const supabase = getServiceSupabase()

    const { data: customerUser } = await supabase
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', event.data.object.customer)
      .single()

    let profile = null
    let subscription = null

    switch (event.type) {
      case 'customer.subscription.created':
        if (customerUser) {
          profile = await supabase
            .from('profiles')
            .update({
              is_subscribed: true,
              updated_at: new Date(),
            })
            .eq('id', customerUser.id)
            .select()

          subscription = await supabase
            .from('subscriptions')
            .insert([
              {
                id: event.data.object.id,
                user_id: customerUser.id,
                status: event.data.object.status,
                price_id: event.data.object.items.data[0].price.id,
                current_period_start: new Date(event.data.object.current_period_start * 1000),
                current_period_end: new Date(event.data.object.current_period_end * 1000),
                cancel_at: new Date(event.data.object.cancel_at * 1000),
                cancel_at_period_end: event.data.object.cancel_at_period_end,
                canceled_at: new Date(event.data.object.canceled_at * 1000),
              },
            ])
            .select()

          console.log(subscription.error)
        }

        break
      case 'customer.subscription.updated':
        if (customerUser) {
          subscription = await supabase
            .from('subscriptions')
            .update({
              id: event.data.object.id,
              user_id: customerUser.id,
              status: event.data.object.status,
              price_id: event.data.object.items.data[0].price.id,
              current_period_start: new Date(event.data.object.current_period_start * 1000),
              current_period_end: new Date(event.data.object.current_period_end * 1000),
              cancel_at: new Date(event.data.object.cancel_at * 1000),
              cancel_at_period_end: event.data.object.cancel_at_period_end,
              canceled_at: new Date(event.data.object.canceled_at * 1000),
            })
            .eq('id', event.data.object.id)

          console.log(subscription.error)
        }

        break
      case 'customer.subscription.deleted':
        if (customerUser) {
          profile = await supabase
            .from('profiles')
            .update({
              is_subscribed: false,
              credits: 20,
              date_credits: new Date(),
            })
            .eq('id', customerUser.id)

          await supabase.from('customers').delete().eq('stripe_customer_id', event.data.object.customer)
          await supabase.from('subscriptions').delete().eq('id', event.data.object.id)
        }
        break
    }

    res.send({
      received: true,
      customerUser: { ...customerUser, customer: event.data.object.customer },
      profile,
      subscription,
    })
  } catch (err) {
    console.log(err)
    res.status(400).send({
      received: true,
      customerUser: { customer: event.data.object.customer, error: err },
    })
  }
}

export default handler
