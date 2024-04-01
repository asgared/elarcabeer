import { useRef } from 'react'
import NextLink from 'next/link'

import { useTranslation, withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useInView } from 'framer-motion'

import { Box, Center, Stack, Text, VStack, AspectRatio } from '@chakra-ui/react'
import AuthLayout from '@/components/layouts/AuthLayout'
import AuthForm from '@/components/auth/AuthForm'
import CommunityCardV from '@/components/community/CommunityCardV'

// import { AuthRedirect } from '@/hooks/useAuthUser'

// import IconTaggyLogo from '@/assets/taggyIcons/IconTaggyLogo'
import { ArrowBackIcon } from '@chakra-ui/icons'

function SignInPage() {
  // AuthRedirect()

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const { t } = useTranslation()

  return (
    <AuthLayout
      title={'Auth | Taggy'}
      pageDescription={'Log in to Taggy to generate your captions.'}
    >
      <Stack
        w={'full'}
        direction={{ base: 'column-reverse', lg: 'row' }}
        gap={0}
        ref={ref}
      >
        <Center
          height='100vh'
          flex={1}
          boxShadow='0 0 120px rgba(0,0,0)'
          sx={{
            background: '#191919',
            backgroundImage:
              ' radial-gradient(at 4% 20%, rgb(190, 242, 100) 0, transparent 77%), radial-gradient(at 93% 11%, rgb(245, 245, 245) 0, transparent 50%), radial-gradient(at 27% 12%, rgb(212, 212, 212) 0, transparent 46%), radial-gradient(at 93% 83%, rgb(56, 189, 248) 0, transparent 93%), radial-gradient(at 61% 2%, rgb(45, 212, 191) 0, transparent 93%), radial-gradient(at 75% 41%, rgb(56, 189, 248) 0, transparent 78%)',
          }}
        >
          <VStack
            w={'340px'}
            m={8}
          >
            <AspectRatio ratio={9 / 16}>
              <NextLink
                href={'/'}
                passHref
              >
                <Text
                  color={'taggyDark.100'}
                  w={'full'}
                  fontSize={'sm'}
                  p={0}
                  mb={2}
                  display={'flex'}
                  alignItems={'center'}
                >
                  <ArrowBackIcon />
                  {t('links.backTaggy')}
                </Text>
              </NextLink>

              <Box
                transform={'translateX(-100px)'}
                opacity={0}
                sx={{
                  transform: isInView ? 'none' : 'translateX(-200px)',
                  opacity: isInView ? 1 : 0,
                  transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s',
                }}
              >
                <CommunityCardV
                  image={'/images/demos/demo_0222.png'}
                  typeUser={1}
                  text={t('community.cardShow.text')}
                  tags={t('community.cardShow.tags')}
                />
              </Box>
            </AspectRatio>
          </VStack>
        </Center>
        <Center flex={{ base: '1', lg: '2' }}>
          <Box
            height={'100vh'}
            display={'grid'}
            placeContent={'center'}
          >
            <VStack
              rounded={{ base: 0, md: 6 }}
              bg={'taggyDark.50'}
              border={'1px'}
              borderColor={'taggyDark.300'}
              justifyContent={'center'}
              p={12}
              height={{ base: '100vh', md: 'auto' }}
            >
              <Box
                mb={6}
                textAlign={'center'}
              >
                <Text color={'taggyDark.600'}>Welcome to </Text>
                {/* <IconTaggyLogo width={'200px'} /> */}
              </Box>
              <AuthForm />
            </VStack>
          </Box>
        </Center>
      </Stack>
    </AuthLayout>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default withTranslation(['common'])(SignInPage)
