import Head from 'next/head'
import { Box } from '@chakra-ui/react'
import { Footer, Header } from '../ui'
interface Props {
  children: React.ReactNode | React.ReactNode[]
  title: string
  pageDescription: string
  imageUrl?: string
}

export default function LandingLayout({
  children,
  imageUrl = 'https://kcucmyjfkamgodxkmurb.supabase.co/storage/v1/object/public/taggy-assets/og-image-updated.jpg?t=2023-08-24T16%3A25%3A57.112Z?t=2023-08-13T16%3A48%3A30.944Z',
  pageDescription,
  title,
}: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name='title'
          content={title}
        />
        <meta
          name='description'
          content={pageDescription}
        />

        <meta
          property='og:type'
          content='website'
        />
        <meta
          property='og:title'
          content={title}
        />
        <meta
          property='og:description'
          content={pageDescription}
        />
        <meta
          property='og:url'
          content='https://www.taggyai.com'
        />
        <meta
          property='og:image'
          content={imageUrl}
        />

        {/* TWITTER  */}
        <meta
          name='twitter:card'
          content='summary_large_image'
        />
        <meta
          name='twitter:site'
          content='@taggy_ai'
        />
        <meta
          name='twitter:title'
          content={title}
        />
        <meta
          name='twitter:description'
          content={pageDescription}
        />
        <meta
          name='twitter:image:src'
          content={imageUrl}
        />
        <meta
          name='twitter:creator'
          content='@ljaviertovar'
        />
      </Head>

      <Header typeNav='landing' />

      <Box
        as={'main'}
        className='taggy__layout'
        width='full'
        margin={'auto'}
      >
        {children}
      </Box>

      <Footer />
    </>
  )
}
