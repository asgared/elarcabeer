import { Flex, Image, Text, VStack, useMediaQuery } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'next-i18next'

export default function AsSeenOn() {
  const { t } = useTranslation('home')

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  return (
    <VStack
      gap={6}
      mb={{ base: 6, lg: 12 }}
    >
      <Text
        fontSize={'lg'}
        fontWeight={'bold'}
      >
        {t('asSeenOn')}
      </Text>
      <Flex
        id='taggy__as-seen-on'
        gap={4}
        flexDirection={`${isDesktop ? 'row' : 'column'}`}
        alignItems={'center'}
      >
        <Link
          href='https://www.futurepedia.io/tool/taggy?utm_source=taggy_embed'
          target='_black'
          rel='noreferrer'
        >
          <Image
            src='https://www.futurepedia.io/api/image-widget?toolId=f5184262-758d-4b43-9205-8167138d7241'
            alt='Taggy | Featured on Futurepedia'
            style={{ width: 250, height: 54 }}
            width={250}
            height={54}
          />
        </Link>
        <Link
          href='https://theresanaiforthat.com/ai/taggy/?ref=embed'
          target='_blank'
          rel='noreferrer'
        >
          <Image
            width={300}
            src='https://media.theresanaiforthat.com/featured3.png'
          />
        </Link>
        <Link
          href='https://topai.tools/t/taggy'
          target='_blank'
          rel='noreferrer'
        >
          <Image
            src='https://topai.tools/assets/img/topai.tools.gif'
            style={{ maxWidth: 300, maxHeight: 80 }}
            alt='Taggy Spotlight on topAI.tools'
          />
        </Link>
      </Flex>
    </VStack>
  )
}
