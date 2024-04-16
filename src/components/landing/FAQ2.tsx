import { useTranslation } from 'next-i18next'

import { Text, Stack, VStack, HStack, Box } from '@chakra-ui/react'

import Title from './Title'
import NextLink from 'next/link'

export default function FAQ2() {
  const { t } = useTranslation('faq')
  const { t: tc } = useTranslation('common')

  return (
    <VStack
      w={'full'}
      mb={12}
    >
      <Title text={t('title')} />

      <Stack
        flexDir={{ base: 'column', lg: 'row' }}
        spacing={{ base: 4, md: 6 }}
      >
        <VStack spacing={{ base: 4, md: 6 }}>
          <div>
            <Text
              as={'h3'}
              fontSize={{ base: 'md', lg: 'lg' }}
              fontWeight={'bold'}
              mb={2}
            >
              {t('q1.question')}
            </Text>
            <Text
              fontSize={{ base: 'sm', lg: 'md' }}
              color={'taggyGray.100'}
            >
              {t('q1.answer')}
            </Text>
          </div>
          <div>
            <Text
              as={'h3'}
              fontSize={{ base: 'md', lg: 'lg' }}
              fontWeight={'bold'}
              mb={2}
            >
              {t('q3.question')}
            </Text>
            <Text
              fontSize={{ base: 'sm', lg: 'md' }}
              color={'taggyGray.100'}
            >
              {t('q3.answer')}
            </Text>
          </div>
          <div>
            <Text
              as={'h3'}
              fontSize={{ base: 'md', lg: 'lg' }}
              fontWeight={'bold'}
              mb={2}
            >
              {t('q5.question')}
            </Text>
            <Text
              fontSize={{ base: 'sm', lg: 'md' }}
              color={'taggyGray.100'}
            >
              {t('q5.answer')}
            </Text>
            <HStack
              alignItems={'center'}
              mt={4}
            >
              <NextLink
                href='https://twitter.com/taggy_ai'
                target='_blank'
                passHref
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Text textDecor={'underline'}>@taggy_ai</Text>
              </NextLink>
            </HStack>
            <NextLink
              href='https://docs.google.com/forms/d/e/1FAIpQLSf7V_kD51kod0ar3pbnBZmZQ9x6OSoZCFb1BGE_Bbd3pbxovg/viewform?usp=sf_link'
              target='_blank'
              passHref
            >
              <Text textDecor={'underline'}>{tc('buttons.feedback')}</Text>
            </NextLink>
          </div>
        </VStack>

        <VStack spacing={{ base: 4, md: 6 }}>
          <div>
            <Text
              as={'h3'}
              fontSize={{ base: 'md', lg: 'lg' }}
              fontWeight={'bold'}
              mb={2}
            >
              {t('q2.question')}
            </Text>
            <Text
              fontSize={{ base: 'sm', lg: 'md' }}
              color={'taggyGray.100'}
            >
              {t('q2.answer')}
            </Text>
          </div>
          <div>
            <Text
              as={'h3'}
              fontSize={{ base: 'md', lg: 'lg' }}
              fontWeight={'bold'}
              mb={2}
            >
              {t('q4.question')}
            </Text>
            <Text
              fontSize={{ base: 'sm', lg: 'md' }}
              color={'taggyGray.100'}
            >
              {t('q4.answer')}
            </Text>
            <Box mt={4}>
              <NextLink
                href='https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DAndroid'
                target='_blank'
                rel={'noreferrer'}
                passHref
              >
                <Text textDecor={'underline'}>{t('howInstallPWA')}</Text>
              </NextLink>
            </Box>
          </div>
        </VStack>
      </Stack>
    </VStack>
  )
}
