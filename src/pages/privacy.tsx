import NextLink from 'next/link'
import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Box, Text } from '@chakra-ui/react'

import AppLayout from '@/components/layouts/AppLayout'

const PrivacyPage = () => {
  return (
    <AppLayout
      title={'Taggy - Privacy Policy'}
      pageDescription={'Privacy Policy'}
      imageUrl={
        'https://poipgxodwlrddqeqauwg.supabase.co/storage/v1/object/public/arca-assets/el_arca.jpg'
      }
    >
      <Box
        width={{ base: 'full', lg: '2xl' }}
        margin={'auto'}
        mb={12}
        px={4}
      >
        <Text
          fontSize={'2xl'}
          fontWeight={'bold'}
          textAlign={'center'}
          my={6}
        >
          Privacy Policy
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          1. Information Collection
        </Text>
        <Text>
          We do not collect any personal information from our users. However, we may collect non-personal data, such as
          usage statistics, device information, and browser type, for analytical purposes. By using this website, you
          agree to the collection of such information.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          2. Use of Third-Party Technologies
        </Text>
        <Text mb={2}>
          We may use third-party services (openai.com, cloudinary.com, supabase.com) to assist in generating image
          captions, authentication, and databases. These third-party services may have their own privacy policies and
          terms of use that you should review. We are not responsible for the privacy practices of third parties.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          3. Cookies
        </Text>
        <Text mb={2}>
          We do not place any cookies on this website. However, please note that third parties, such as Supabase, may
          create cookies for the proper functioning of their services, such as authentication.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          4. Information We Collect
        </Text>
        <Text mb={2}>
          We collect personal information that you voluntarily provide to us, such as your email address and payment
          information when you subscribe to our services or contact us through our website.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          5. Security
        </Text>
        <Text mb={2}>
          a. We take reasonable measures to protect the personal information we collect from unauthorized access, use,
          or disclosure.
        </Text>
        <Text mb={2}>
          b. However, no method of Internet transmission or electronic storage is 100% secure. We cannot guarantee the
          absolute security of your personal information.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          6. Changes to This Policy
        </Text>
        <Text mb={2}>
          a. We may change this Privacy Policy from time to time by posting the updated policy on our website.
        </Text>
        <Text mb={2}>
          b. Your continued use of our website after we make changes to this Privacy Policy constitutes your acceptance
          of the changes.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          7. Contact Information
        </Text>
        <Text mb={2}>
          If you have any questions about these Privacy or the Application, please contact me on{' '}
          <NextLink
            href='https://twitter.com/taggy_ai'
            target='_blank'
            rel={'noreferrer'}
          >
            <span style={{ textDecoration: 'underline' }}>Twitter (now X).</span>
          </NextLink>
        </Text>
      </Box>
    </AppLayout>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer'])),
    },
  }
}

export default withTranslation(['common', 'footer'])(PrivacyPage)
