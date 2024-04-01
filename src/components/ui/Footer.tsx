import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import { Box, Center, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { FaInstagram } from 'react-icons/fa'
// import { IconTaggy } from '@/assets/taggyIcons'
// import XIcon from '@/assets/XIcon'

export default function Footer() {
  const { t } = useTranslation()
  const { t: tf } = useTranslation('landing')

  const { route } = useRouter()

  return (
    <Box
      as={'footer'}
      width={'full'}
      p={4}
      className='footer-taggy'
      borderTop={'1px'}
      borderTopColor={'taggyDark.300'}
    >
      <Center
        width={['100%', '100%', '90%', '90%', '80%']}
        maxW={'1200px'}
        margin={'auto'}
        px={4}
        fontSize={'xs'}
        color={'taggyGray.100'}
      >
        <Stack
          gap={4}
          fontSize='md'
          w='full'
          justifyContent={'space-between'}
          alignItems={'center'}
          flexDirection={{ base: 'column', lg: 'row' }}
        >
          <Flex
            gap={4}
            alignItems={'center'}
          >
            <NextLink
              href='/'
              passHref
            >
              <Box
                title='taggyai.com'
                width={['30px']}
                height={['30px']}
                rounded={'50%'}
                bg={'taggyDark.50'}
                border={'1px'}
                borderColor={'taggyDark.300'}
                _hover={{ borderColor: 'taggyText.900' }}
              >
                {/* <IconTaggy /> */}
              </Box>
            </NextLink>
            <NextLink
              href='https://twitter.com/taggy_ai'
              target='_blank'
              passHref
            >
              <div
                style={{ width: '16px' }}
                title='twitter/taggy_ai'
              >
                {/* <XIcon /> */}
              </div>
            </NextLink>
            <NextLink
              href='https://www.instagram.com/taggy_ai/'
              target='_blank'
              passHref
            >
              <Box
                _hover={{ color: 'taggyText.900' }}
                title='instagram/taggy_ai'
              >
                <FaInstagram />
              </Box>
            </NextLink>
            <Text
              fontSize='xs'
              mt={1}
            >
              © 2023 Taggy
            </Text>
          </Flex>
          <Flex
            gap={4}
            alignItems={'center'}
            fontSize={'sm'}
            flexDirection={{ base: 'column-reverse', md: 'row' }}
          >
            {route === '/' && (
              <>
                <NextLink
                  href='terms'
                  passHref
                >
                  <Box _hover={{ color: 'taggyText.900' }}>{tf('nav.terms')}</Box>
                </NextLink>
                <NextLink
                  href='/privacy'
                  passHref
                >
                  <Box _hover={{ color: 'taggyText.900' }}>{tf('nav.privacy')}</Box>
                </NextLink>
                <NextLink
                  href='/pricing'
                  passHref
                >
                  <Box _hover={{ color: 'taggyText.900' }}>{tf('nav.pricing')}</Box>
                </NextLink>
                <NextLink
                  href='#upload-section'
                  passHref
                >
                  <Box _hover={{ color: 'taggyText.900' }}>{tf('nav.howItWorks')}</Box>
                </NextLink>
                <NextLink
                  href='#community-section'
                  passHref
                >
                  <Box _hover={{ color: 'taggyText.900' }}>{tf('nav.community')}</Box>
                </NextLink>
              </>
            )}
          </Flex>
          {route !== '/' && (
            <HStack gap={6}>
              <NextLink
                href='https://docs.google.com/forms/d/e/1FAIpQLSf7V_kD51kod0ar3pbnBZmZQ9x6OSoZCFb1BGE_Bbd3pbxovg/viewform?usp=sf_link'
                target='_blank'
                passHref
                rel={'noreferrer'}
              >
                <Box _hover={{ color: 'taggyText.900' }}>{t('buttons.feedback')}</Box>
              </NextLink>

              {/* <NextLink
                href='https://www.buymeacoffee.com/ljaviertovar'
                target='_blank'
                passHref
                rel={'noreferrer'}
              >
                <Image
                  src='https://cdn.buymeacoffee.com/buttons/v2/default-blue.png'
                  alt='Buy Me A Coffee'
                  width={'120px'}
                />
              </NextLink> */}
            </HStack>
          )}
        </Stack>
      </Center>

      <Center
        width={['100%', '100%', '90%', '90%', '80%']}
        maxW={'1200px'}
        margin={'auto'}
        fontSize={'xs'}
        color={'taggyDark.600'}
        mt={{ base: 6, lg: 2 }}
      >
        <HStack>
          <Text
            fontSize={'sm'}
            color={'taggyDark.600'}
          >
            Developed by
          </Text>
          <NextLink
            href='https://twitter.com/ljaviertovar'
            target='_blank'
            passHref
            rel={'noreferrer'}
          >
            <Text
              fontSize={'sm'}
              textDecor={'underline'}
              color={'taggyDark.600'}
              _hover={{ color: 'taggyText.900' }}
            >
              @ljaviertovar
            </Text>
          </NextLink>
          <NextLink
            href='https://www.instagram.com/asgaredmc/'
            target='_blank'
            passHref
            rel={'noreferrer'}
          >
            <Text
              fontSize={'sm'}
              textDecor={'underline'}
              color={'taggyDark.600'}
              _hover={{ color: 'taggyText.900' }}
            >
              @asgaredmc
            </Text>
          </NextLink>
        </HStack>
      </Center>
    </Box>
  )
}
