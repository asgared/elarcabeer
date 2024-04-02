import NextLink from 'next/link'
import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Box, Text } from '@chakra-ui/react'

import AppLayout from '@/components/layouts/AppLayout'

const TermsPage = () => {
  return (
    <AppLayout
      title={'Taggy - Terms & Conditions'}
      pageDescription={'Terms and Conditions'}
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
          Terms and Conditions
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          1. Acceptance of the Terms
        </Text>
        <Text>
          By accessing or using the Taggy Application, you agree to comply with and be bound by these Terms. If you do
          not agree to these Terms, please do not use the Application.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          2. Use of the Application
        </Text>
        <Text mb={2}>
          2.1 Eligibility: You must be at least 18 years old to use the Application. By using the Application, you
          represent and warrant that you are of legal age.
        </Text>
        <Text mb={2}>
          2.2 User Account: You may need to create an account to access certain application features. You are
          responsible for maintaining the confidentiality of your account information.
        </Text>
        <Text mb={2}>
          a. By using the Application, you may generate content. You retain all ownership rights to your content. By
          uploading content to the Application, you grant us a worldwide, non-exclusive, royalty-free license to use,
          modify, display, and distribute your content.
        </Text>
        <Text mb={2}>
          b. Our website allows users to upload images and generate captions based on those images. By uploading an
          image, you represent and warrant that you own or have the licenses, rights, consents, and permissions
          necessary to use and authorize us to use the image for the purpose of generating a caption.
        </Text>
        <Text mb={2}>
          c. You are solely responsible for the content you upload to our website. We reserve the right to remove any
          content that we believe violates these Terms.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          3. Privacy
        </Text>
        <Text mb={2}>
          Our Privacy Policy also governs your use of the Application. By using the Application, you consent to the
          practices described in the{' '}
          <NextLink href={'/privacy'}>
            <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>
          </NextLink>
          .
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          4. Image Upload and Storage
        </Text>
        <Text mb={2}>
          4.1 Uploads: When uploading images to Taggy, they are temporarily stored for caption generation. All uploaded
          images are automatically deleted from our servers every 24 hours.
        </Text>
        <Text mb={2}>
          4.2 Image Formats and Sizes: Taggy accepts images in JPG, JPEG, and PNG formats, with a maximum image size of
          6MB.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          5. Intellectual Property
        </Text>
        <Text mb={2}>
          a. The content and materials on our website, including, but not limited to, text, graphics, logos, and images,
          are either owned by us or licensed to us and are protected by copyright, trademark, and other intellectual
          property laws.
        </Text>
        <Text mb={2}>b. You may not use our content or materials without our prior written consent.</Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          6. User Conduct
        </Text>
        <Text
          mb={2}
          whiteSpace={'pre-line'}
        >
          {`You agree not to:
          - Use the Application for illegal purposes.
          - Impersonate any person or entity.
          - Attempt to gain unauthorized access to the Application.
          - Interfere with or disrupt the operation of the Application.
          - Violate any applicable laws or regulations.`}
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          7. Disclaimer and Limitation of Liability
        </Text>
        <Text mb={2}>
          {`7.1 No Warranty: The Application is provided "as is" without warranties of any kind, whether express or
          implied, including, but not limited to, implied warranties of merchantability, fitness for a particular
          purpose, or non-infringement.`}
        </Text>
        <Text mb={2}>
          7.2 Limitation of Liability: We shall not be liable for any indirect, incidental, special, consequential, or
          punitive damages, or for the loss of profits or revenue.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          8. Changes to the Terms
        </Text>
        <Text mb={2}>
          We reserve the right to modify or revise these Terms at any time. The updated Terms will be posted on the
          Application, and your continued use of the Application after any changes constitutes your acceptance of the
          revised Terms.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          9. Termination
        </Text>
        <Text mb={2}>
          We may terminate or suspend your account and access to the Application at our sole discretion without prior
          notice for violating these Terms.
        </Text>
        <Text
          fontSize={'lg'}
          fontWeight={'bold'}
          mt={4}
          mb={2}
        >
          10. Contact Information
        </Text>
        <Text mb={2}>
          If you have any questions about these Terms or the Application, please contact me on{' '}
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

export default withTranslation(['common', 'footer'])(TermsPage)
