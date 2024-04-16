import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  useMediaQuery,
  Menu,
  MenuButton,
  Avatar,
  VStack,
  Text,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import IconArcaLogoHeader from '@/assets/arcaIcons/IconArcaLogoHeader'
import { FaSignOutAlt } from 'react-icons/fa'

import NavLink from './NavLink'
import NextLink from 'next/link'
import { signOut, useUserContext } from '@/hooks/useAuthUser'
import { FiChevronDown } from 'react-icons/fi'
import { useTaggyStore } from '@/store/taggyStore'
import BadgedPlan from './BadgedPlan'
import MenuNavLink from './MenuNavLink'

export default function NavBarLanding() {
  const userContext = useUserContext()
  const user = userContext?.user
  const isLoading = userContext?.isLoading
  const mySession = userContext?.session

  const setInitialState = useTaggyStore(state => state.setInitialState)

  const { t } = useTranslation('landing')
  const { t: tc } = useTranslation()

  const { push, pathname } = useRouter()

  const [isDesktop] = useMediaQuery('(min-width: 1025px)')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const linksMenu = useMemo(
    () => [
      {
        href: '/pricing',
        text: t('nav.pricing'),
      },
      {
        href: '#upload-section',
        text: t('nav.howItWorks'),
      },
      {
        href: '#community-section',
        text: t('nav.community'),
      },
    ],
    [t]
  )

  const linksMobile = useMemo(
    () => [
      {
        href: '#community-section',
        text: t('nav.community'),
      },
      {
        href: '#upload-section',
        text: t('nav.howItWorks'),
      },
      {
        href: '/pricing',
        text: t('nav.pricing'),
      },
    ],
    []
  )

  return (
    <Box
      id='taggy-navbar'
      as='nav'
      width={['100%', '100%', '90%', '90%', '80%']}
      maxW={'1200px'}
      margin={'auto'}
      px={4}
    >
      <Flex
        h={14}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex
          flex={{ base: 1, lg: 0 }}
          alignItems={'center'}
        >
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ xl: 'none' }}
            bg={'transparent'}
            _hover={{
              background: 'transparent',
            }}
            onClick={isOpen ? onClose : onOpen}
          />
          {!isDesktop && (
            <NextLink href={'/'}>
              <IconArcaLogoHeader width={'75px'} />
            </NextLink>
          )}
        </Flex>
        {isDesktop && (
          <Flex flex={1}>
            <HStack
              spacing={4}
              alignItems={'center'}
            >
              <NextLink href={'/'}>
                <IconArcaLogoHeader width={'75px'} />
              </NextLink>
            </HStack>
          </Flex>
        )}
        <Flex
          flex={2}
          justifyContent={'flex-end'}
        >
          <HStack spacing={4}>
            {isDesktop && pathname === '/' && (
              <>
                {linksMenu.map(link => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    text={link.text}
                  />
                ))}
              </>
            )}

            {!mySession ? (
              <Button
                size={'sm'}
                fontSize={'sm'}
                fontWeight={'bold'}
                color={'taggyDark.50'}
                background={'#E0E0E0'}
                _hover={{ background: 'white' }}
                onClick={() => {
                  push('/auth')
                }}
              >
                {isDesktop ? t('tryItNowBtn') : t('tryItNowBtnMobile')}
              </Button>
            ) : (
              <Flex alignItems={'center'}>
                <Menu>
                  <MenuButton
                    py={2}
                    fontSize={'sm'}
                    _hover={{
                      color: 'taggyText.900',
                    }}
                    transition='all 0.3s'
                    _focus={{ boxShadow: 'none' }}
                  >
                    <HStack px={{ base: 3, md: 0 }}>
                      <Avatar
                        size={'sm'}
                        src={user?.user_metadata?.avatar_url}
                      />

                      <VStack
                        display={{ base: 'none', md: 'flex' }}
                        alignItems='flex-start'
                        spacing='1px'
                        ml='2'
                      >
                        <Text fontSize='sm'>{user?.user_metadata?.name ?? user?.email}</Text>
                      </VStack>
                      <Box display={'flex'}>
                        <FiChevronDown />
                      </Box>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    bg={'taggyGray.900'}
                    zIndex={'tooltip'}
                    border={'1px'}
                    borderColor={'taggyDark.300'}
                    boxShadow='0 6px 10px rgba(0,0,0,0.4)'
                  >
                    <MenuItem
                      display={{ base: 'flex', md: 'none' }}
                      gap={2}
                      justifyContent={'space-between'}
                      backgroundColor={'taggyDark.300'}
                      color={'taggyText.900'}
                      _hover={{ cursor: 'default', color: 'taggyText.900', background: 'taggyDark.300' }}
                    >
                      <Text fontSize='sm'>{user?.user_metadata?.name ?? user?.email}</Text>
                      <BadgedPlan
                        plan={user?.dataCustomer?.product_name}
                        loading={isLoading as boolean}
                      />
                    </MenuItem>

                    <MenuDivider
                      display={{ base: 'block', md: 'none' }}
                      borderColor={'taggyDark.300'}
                    />
                    <MenuNavLink handle={async () => await push('/app/dashboard')}>
                      {tc('navLinks.dashboard')}
                    </MenuNavLink>
                    <MenuDivider borderColor={'taggyDark.300'} />
                    <MenuItem
                      backgroundColor={'transparent'}
                      gap={2}
                      _hover={{ color: 'taggyText.900', background: 'taggyDark.300' }}
                      onClick={async () => {
                        setInitialState()
                        await signOut()
                      }}
                    >
                      <FaSignOutAlt />
                      {tc('buttons.signout')}
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            )}
          </HStack>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box
          id='taggy-menu-mobile'
          pb={4}
          opacity={`${isOpen ? 1 : 0}`}
          display={{ xl: 'none' }}
          transition='all 0.3s'
        >
          <Stack
            as={'nav'}
            spacing={4}
          >
            {linksMobile.map(link => (
              <NavLink
                key={link.href}
                href={link.href}
                text={link.text}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}
