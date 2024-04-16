import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'

import { Badge, Box, FormControl, HStack, Input, List, ListIcon, ListItem, Text, VStack } from '@chakra-ui/react'

import PrimaryPricingButton from './PrimaryPricingButton'
import SecondaryPricingButton from './SecondaryPricingButton'

import { FaCheckCircle } from 'react-icons/fa'

import { useUserContext } from '@/hooks/useAuthUser'

import { useState } from 'react'
import { type FeaturePrice, type Plan } from '@/types'

interface Props {
  popular?: boolean
  plan?: Plan
  features: FeaturePrice[]
  inputRef?: any
  emailError?: boolean
}

export default function PricingCard({ popular = false, plan, features = [], inputRef, emailError }: Props) {
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const userContext = useUserContext()
  const user = userContext?.user
  const isLoading = userContext?.isLoading

  const { push } = useRouter()

  const { t } = useTranslation('landing')

  const getBtnText = (price?: number) => {
    if (!!user && !user.is_subscribed) {
      if (price === 0) return t('pricing.generateNow')
      return t('pricing.subscribe')
    }
    if (!!user && user.is_subscribed) {
      if (price === 0) return t('pricing.generateNow')
      return t('pricing.manageSubscription')
    }

    return t('pricing.createAccount')
  }

  const handleClick = async (priceId?: string | null) => {
    setLoadingCheckout(true)

    if (!!user && !user.is_subscribed) {
      const { data } = await axios.get(`/api/stripe/subscription/${priceId as string}`)
      if (data.id) {
        const stripeCheckout = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)
        await stripeCheckout?.redirectToCheckout({ sessionId: data.id })
      }
    } else if (!!user && user.is_subscribed) {
      const { data } = await axios.get('/api/stripe/portal')
      push(data.url)
    } else {
      push('/auth')
    }
  }

  const handleClickFree = () => {
    if (!user) {
      push('/auth')
    } else {
      push('/app/dashboard')
    }
  }

  return (
    <Box
      bg={'taggyDark.200'}
      w={{ base: 'full', md: 'sm' }}
      borderWidth='1px'
      alignSelf={{ base: 'center', lg: 'flex-start' }}
      borderColor={`${!popular ? 'taggyDark.300' : 'white'}`}
      borderRadius={6}
      overflow='hidden'
    >
      <Box position='relative'>
        {popular && (
          <Box
            pos={'absolute'}
            py={1}
            px={2}
            right={0}
          >
            <Badge
              bg={'taggyDark.50'}
              color='taggySecondary.100'
              fontSize={'xs'}
              fontWeight={'bold'}
              fontFamily={'boston-bold'}
            >
              Popular
            </Badge>
          </Box>
        )}
        <Box
          backgroundImage={`/images/plans/${plan?.price === 0 ? 'Hobby' : 'Creator'}.png`}
          backgroundRepeat={'no-repeat'}
          backgroundPosition={'center'}
          backgroundSize={'cover'}
          borderRadius={6}
        >
          <Box
            p={6}
            bg={'rgba(0,0,0,0.6)'}
            color={'white'}
            textShadow={'0px 0px 1px rgba(0,0,0)'}
          >
            <Text
              fontSize='2xl'
              fontWeight={'bold'}
              fontFamily={'boston-bold'}
              textShadow={'0px 0px 1px rgba(0,0,0)'}
            >
              {plan?.name}
            </Text>
            {plan?.price === 0 ? (
              <Text
                fontSize='5xl'
                fontFamily={'boston-bold'}
              >
                Free
              </Text>
            ) : (
              <HStack justifyContent='center'>
                {plan?.price === null ? (
                  <Text
                    fontSize='5xl'
                    fontWeight='bold'
                  >
                    --
                  </Text>
                ) : (
                  <HStack>
                    <VStack
                      gap={0}
                      alignItems={'flex-start'}
                    >
                      <span style={{ textDecoration: 'line-through' }}>$6.99</span>
                      <Text
                        fontSize='5xl'
                        fontWeight='bold'
                        lineHeight={1}
                      >
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format((plan?.price as number) / 100)}
                        <Box
                          as='span'
                          fontSize={'2xl'}
                        >
                          / {plan?.interval}
                        </Box>
                      </Text>
                    </VStack>
                  </HStack>
                )}
              </HStack>
            )}
          </Box>
        </Box>
        <VStack
          bg={'taggyDark.50'}
          p={6}
          borderBottomRadius={6}
        >
          <List
            spacing={3}
            textAlign='start'
          >
            {features.map(f => (
              <ListItem key={f.id}>
                <ListIcon
                  as={FaCheckCircle}
                  color='taggySecondary.100'
                />
                {f.feature}
              </ListItem>
            ))}
          </List>
          {!isLoading && (
            <Box
              w='80%'
              pt={7}
            >
              {inputRef && popular && (
                <>
                  <FormControl
                    id='email'
                    isRequired
                    mb={4}
                  >
                    <Input
                      ref={inputRef}
                      height={'40px'}
                      placeholder='your-email@example.com'
                      _placeholder={{ color: 'gray.500' }}
                      type='email'
                    />
                    {emailError && (
                      <Text
                        fontSize={'xs'}
                        color={'red.500'}
                        textAlign={'left'}
                        mt={2}
                      >
                        {t('addWaitListError')}
                      </Text>
                    )}
                  </FormControl>
                  <PrimaryPricingButton
                    id={'price-button-popular'}
                    loading={loadingCheckout}
                    handleClick={handleClick}
                  >
                    holi
                  </PrimaryPricingButton>
                </>
              )}

              {popular && !inputRef && (
                <PrimaryPricingButton
                  id={'price-button-popular'}
                  loading={loadingCheckout}
                  handleClick={() => {
                    handleClick(plan?.id)
                  }}
                >
                  {getBtnText()}
                </PrimaryPricingButton>
              )}

              {!popular && (
                <SecondaryPricingButton
                  id={''}
                  handleClick={() => {
                    handleClickFree()
                  }}
                >
                  {getBtnText(plan?.price)}
                </SecondaryPricingButton>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  )
}
