import { useMemo } from 'react'
import { useTranslation } from 'next-i18next'

// import confetti from 'canvas-confetti'

import { Stack, Heading, Text, VStack } from '@chakra-ui/react'

import PricingCard2 from './PricingCard'

import { type FeaturePrice } from '@/types'
// import { supabase } from '@/utils/supabaseClient'

import { type Plan } from '../../types'

interface Props {
  plans: Plan[]
}

export default function Princing({ plans }: Props) {
  // const [emailError, setEmailError] = useState(false)
  // const [successMsg, setSuccessMsg] = useState(false)
  // const inputRef = useRef<HTMLInputElement | null>(null)

  const { t } = useTranslation('landing')

  const hobbyFeatures: FeaturePrice[] = useMemo(
    () => [
      {
        id: 1,
        feature: t('features.hobbyFeatures.feature1'),
      },
      {
        id: 2,
        feature: t('features.hobbyFeatures.feature2'),
      },
      {
        id: 3,
        feature: t('features.hobbyFeatures.feature3'),
      },
      {
        id: 4,
        feature: t('features.hobbyFeatures.feature4'),
      },
    ],
    [t]
  )

  const CreatorFeatures: FeaturePrice[] = useMemo(
    () => [
      {
        id: 0,
        feature: t('features.creatorFeatures.hobby'),
      },
      {
        id: 1,
        feature: t('features.creatorFeatures.feature1'),
      },
      {
        id: 2,
        feature: t('features.creatorFeatures.feature2'),
      },
      {
        id: 3,
        feature: t('features.creatorFeatures.feature3'),
      },
      {
        id: 4,
        feature: t('features.creatorFeatures.feature4'),
      },
      {
        id: 5,
        feature: t('features.creatorFeatures.feature5'),
      },
      {
        id: 6,
        feature: t('features.creatorFeatures.feature6'),
      },
      {
        id: 7,
        feature: t('features.creatorFeatures.feature7'),
      },
    ],
    [t]
  )

  // const sendEmailWaitlist = async () => {
  //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  //   const value = inputRef?.current?.value as string
  //   const isValidEmail = emailRegex.test(value)

  //   if (!inputRef.current || !isValidEmail) {
  //     setEmailError(true)
  //     setSuccessMsg(false)
  //     return
  //   }
  //   setEmailError(false)

  //   const { data, error } = await supabase.from('waitlist').upsert({ email: value }).select('*')

  //   if (data ?? error?.code === '23505') {
  //     setSuccessMsg(true)
  //     confetti({
  //       zIndex: 10000,
  //       particleCount: 100,
  //       spread: 160,
  //       angle: -100,
  //       origin: {
  //         x: 1,
  //         y: 0,
  //       },
  //     })
  //   }
  // }

  return (
    <>
      <VStack
        spacing={2}
        textAlign='center'
        my={{ base: 4, lg: 6 }}
      >
        <Heading
          as={'h2'}
          color='white'
          fontSize={['2xl', '3xl', '3xl', '4xl', '4xl']}
          textAlign={'center'}
          fontWeight={'bold'}
          fontFamily='boston-bold'
        >
          {t('pricing.title')}
        </Heading>
        <Heading
          as={'h3'}
          color={'taggyGray.100'}
          fontSize={{ base: 'lg', lg: 'xl' }}
          textAlign={'center'}
        >
          {t('pricing.subtitle')}
        </Heading>
      </VStack>

      <Stack
        direction={{ base: 'column', lg: 'row' }}
        textAlign='center'
        justify='center'
        spacing={{ base: 4, md: 6 }}
        py={10}
      >
        <VStack>
          <PricingCard2
            features={hobbyFeatures}
            plan={{ id: 'hobby-plan', price: 0, name: 'Hobby', interval: 'month', currency: 'USD', image: '' }}
          />
          <Text
            fontSize={'sm'}
            color={'taggyGray.100'}
          >
            {t('pricing.description')}
          </Text>
        </VStack>
        {plans.map((plan: Plan) => (
          <PricingCard2
            key={plan.id}
            popular
            plan={plan}
            features={plan.name === 'Creator' ? CreatorFeatures : []}
          />
        ))}
      </Stack>
    </>
  )
}
