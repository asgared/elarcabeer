import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'

import { Box, HStack, Text } from '@chakra-ui/react'
import FooterApp from '../ui/FooterApp'
import { Header } from '../ui'

interface Props {
  children: React.ReactNode | React.ReactNode[]
  title: string
  pageDescription: string
  imageUrl?: string
  typeNav?: 'landing' | 'app' | 'account'
}

export default function AccountLayout({ children, imageUrl = '/images/og-image.jpg', pageDescription, title }: Props) {
  const { t } = useTranslation()

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name='title'
          content={title}
        />
      </Head>
      <Header typeNav={'app'} />
      <Box
        as={'main'}
        width={['100%', '100%', '90%', '80%']}
        maxW={'1200px'}
        margin={'auto'}
        p={{ base: 0, md: 4 }}
        mt={{ base: 0, md: 4 }}
        mb={12}
      >
        {children}
      </Box>
      <HStack
        p={4}
        fontSize={'sm'}
        color={'taggySecondary.900'}
        justifyContent={'center'}
        width={'full'}
        bg={'#161616'}
      >
        <Text>{t('newFeatures')}</Text>
        <NextLink
          href='/#pricing-section'
          passHref
        >
          <Text
            color={'taggySecondary.900'}
            textDecoration={'underline'}
          >
            {t('chekItOut')}
          </Text>
        </NextLink>
      </HStack>
      <FooterApp />
    </>
  )
}
