import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Box } from '@chakra-ui/react'

import LandingLayout from '@/components/layouts/LandingLayout'
import LandingSection from '@/components/ui/LandingSection'
import Princing from '@/components/landing/Pricing'
import FAQ2 from '@/components/landing/FAQ2'

import { getNewStripe } from '@/utils/stripe-client'

import { type Plan } from '../types'

interface Props {
  plans: Plan[]
}

const PricingPage = ({ plans }: Props) => {
  return (
    <LandingLayout
      title={'Cervecería el Arca'}
      pageDescription={
        'En la cervecería artesanal El Arca, creamos cervezas únicas inspiradas en barcos legendarios de diferentes países. Nuestros productos son el resultado de años de experiencia y pasión por la elaboración de cerveza artesanal. Descubre nuestros tres estilos de cerveza y nuestras deliciosas galletas "Naufragio", hechas con cebada sobrante de la elaboración de la cerveza. ¡Ven y saborea la historia con nosotros!'
      }
      imageUrl={
        'https://kcucmyjfkamgodxkmurb.supabase.co/storage/v1/object/public/taggy-assets/og-image-updated.jpg?t=2023-08-24T16%3A25%3A57.112Z'
      }
    >
      <>
        <LandingSection
          id='pricing-section'
          hf={false}
        >
          <Box
            maxW={'full'}
            margin={'auto'}
          >
            <Princing plans={plans} />
          </Box>
        </LandingSection>

        <LandingSection
          id='faq-section'
          hf={false}
        >
          <Box
            maxW={'4xl'}
            margin={'auto'}
          >
            <FAQ2 />
          </Box>
        </LandingSection>
      </>
    </LandingLayout>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  const stripe = getNewStripe()

  const { data: prices } = await stripe.prices.list()

  const plans = await Promise.all(
    prices.map(async (price: any) => {
      const product = await stripe.products.retrieve(price.product)
      return {
        id: price.id,
        active: product.active,
        name: product.name,
        price: price.unit_amount,
        interval: price.recurring.interval,
        currency: price.currency,
        image: product.images[0] ?? '',
      }
    })
  )

  const sortedPlans = plans
    .sort((a: { price: number }, b: { price: number }) => a.price - b.price)
    .filter((plan: any) => plan.active)

  return {
    props: {
      plans: sortedPlans,
      ...(await serverSideTranslations(locale, ['common', 'home', 'landing', 'footer', 'faq'])),
    },
  }
}

export default withTranslation(['common', 'home', 'landing', 'footer', 'faq'])(PricingPage)
