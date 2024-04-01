import { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation, withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import axios from 'axios'

import AccountLayout from '@/components/layouts/AppLayout'
import { Alert, AlertIcon, Box, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import ButtonTaggyGhost from '@/components/ui/ButtonTaggyGhost'
import BadgedPlan from '@/components/ui/BadgedPlan'
import Title from '@/components/ui/Title'

import { useUserContext } from '@/hooks/useAuthUser'
import { FaInfinity } from 'react-icons/fa'

const AccountPage = () => {
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const userContext = useUserContext()
  const user = userContext?.user
  const isLoading = userContext?.isLoading

  const { t } = useTranslation('account')

  const { push } = useRouter()

  const goToPortal = async () => {
    setLoadingCheckout(true)
    const { data } = await axios.get('/api/stripe/portal')
    push(data.url)
  }

  return (
    <AccountLayout
      title={'Account - Taggy'}
      pageDescription={''}
    >
      <VStack
        minH={'70vh'}
        w={'full'}
        p={{ base: 4, md: 0 }}
        alignItems={'flex-start'}
      >
        <Box
          w={'full'}
          mb={6}
        >
          <Title text={t('title')} />
        </Box>

        <Stack
          width={'full'}
          flexDir={{ base: 'column', md: 'row' }}
          alignItems={'flex-start'}
          justifyContent={'flex-start'}
          gap={6}
        >
          <HStack>
            <Text>{t('currentPlan')}</Text>
            <BadgedPlan
              loading={isLoading as boolean}
              plan={user?.dataCustomer?.product_name ?? 'Hobby'}
            />
          </HStack>
          <VStack>
            <HStack>
              <Text>{t('credits')}</Text>
              {user.is_subscribed ? <FaInfinity /> : <Text>{user.credits}</Text>}
            </HStack>
            <Text
              fontSize={'sm'}
              color={'taggyGray.500'}
            >
              {t('credistsEqualsTo')}
            </Text>
          </VStack>
        </Stack>

        <VStack
          mt={6}
          gap={4}
          alignItems={'flex-start'}
        >
          {user?.dataCustomer?.sub_cancel_period && (
            <Alert status='warning'>
              <AlertIcon />
              {t('warningAccountMessage')}
              {user.dataCustomer.sub_cancel_at.split(' ')[0]}
            </Alert>
          )}
          {user.is_subscribed ? (
            <ButtonTaggyGhost
              id={'manage-account-btn'}
              handleClick={goToPortal}
              loading={loadingCheckout}
            >
              {t('buttons.manageAccount')}
            </ButtonTaggyGhost>
          ) : (
            <ButtonTaggyGhost
              id={'subscribe-btn'}
              handleClick={async () => await push('/pricing')}
              loading={loadingCheckout}
            >
              {t('buttons.upgradePlan')}
            </ButtonTaggyGhost>
          )}
        </VStack>
      </VStack>
    </AccountLayout>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer', 'account'])),
    },
  }
}

export default withTranslation(['common', 'footer', 'account'])(AccountPage)
