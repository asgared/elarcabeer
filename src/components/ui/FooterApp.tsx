import NextLink from 'next/link'

import { Box, HStack, Text } from '@chakra-ui/react'

// import { IconTaggy } from '@/assets/taggyIcons'

export default function FooterApp() {
  return (
    <Box
      as={'footer'}
      width={'full'}
      p={4}
      className='footer-taggy'
      borderTop={'1px'}
      borderTopColor={'taggyDark.300'}
    >
      <HStack
        width={['100%', '100%', '90%', '90%', '80%']}
        maxW={'1200px'}
        margin={'auto'}
        fontSize={'xs'}
        color={'taggyDark.600'}
        gap={4}
        justifyContent={'center'}
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
        </HStack>
      </HStack>
    </Box>
  )
}
