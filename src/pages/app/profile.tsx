import { useTranslation, withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { supabase } from '@/utils/supabase-client'

import AppLayout from '@/components/layouts/AppLayout'

import { useUserContext } from '@/hooks/useAuthUser'
import { Box, Divider, HStack, Image, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import Title from '@/components/ui/Title'
// import ButtonTaggyGhost from '@/components/ui/ButtonTaggyGhost'
import TabsGenerations from '@/components/profile/TabsGenerations'

import { type Generation } from '@/types'

import styles from '@/styles/section.module.css'
import { useEffect, useState } from 'react'

const ProfilePage = () => {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [community, setCommunity] = useState<Generation[]>([])

  const userContext = useUserContext()
  const user = userContext?.user
  const isLoading = userContext?.isLoading

  const { t } = useTranslation('profile')

  useEffect(() => {
    const getGenerations = async () => {
      const { data } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .range(0, 5)
        .order('created_at', { ascending: false })

      setGenerations(data ?? [])
    }

    if (user) {
      getGenerations()
    }
  }, [user])

  useEffect(() => {
    const getCommunity = async () => {
      const { data } = await supabase
        .from('community')
        .select('*')
        .eq('user_id', user.id)
        .eq('approved', 1)
        .range(0, 5)
        .order('created_at', { ascending: false })

      setCommunity(data ?? [])
    }

    if (user) {
      getCommunity()
    }
  }, [user])

  return (
    <AppLayout
      title={'Profile - Taggy'}
      pageDescription={''}
    >
      <VStack
        minH={'70vh'}
        w={'full'}
        p={{ base: 4, md: 0 }}
      >
        <Box mb={6}>
          <Title text={t('title')} />
        </Box>

        <Skeleton
          isLoaded={!isLoading}
          startColor='taggyGray.700'
          endColor='taggyGray.900'
          // height={{ base: 'auto', md: '80px' }}
          width={'full'}
          margin={' 0 auto'}
          rounded={6}
          mb={6}
        >
          <Stack
            className={`${styles.diagonalBg}`}
            flexDir={{ base: 'column', md: 'row' }}
            justifyContent={'center'}
            border={'1px'}
            borderColor={'taggyDark.300'}
            width={'full'}
            rounded={6}
            overflow={'hidden'}
            p={6}
            // height={{ base: 'auto', md: '80px' }}
          >
            <VStack gap={6}>
              <Box
                id='user-icon'
                height={'full'}
                width={'80px'}
              >
                <Image
                  rounded={'full'}
                  bg={'taggyDark.50'}
                  boxSize={'80px'}
                  objectFit='cover'
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.name ?? user?.email}
                />
              </Box>

              <HStack
                alignItems={'flex-start'}
                gap={6}
              >
                <Text fontSize={{ base: 'md', md: 'lg' }}>{user?.user_metadata?.name ?? user?.email}</Text>
                {user?.email && (
                  <>
                    <Divider orientation='vertical' />
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      color={'taggyGray.100'}
                    >
                      {user.email}
                    </Text>
                  </>
                )}
              </HStack>
            </VStack>
          </Stack>
        </Skeleton>

        <TabsGenerations
          generations={generations ?? []}
          community={community ?? []}
        />
      </VStack>
    </AppLayout>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer', 'profile'])),
      generations: [],
      community: [],
    },
  }
}

export default withTranslation(['common', 'footer', 'profile'])(ProfilePage)
