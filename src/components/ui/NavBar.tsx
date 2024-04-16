import { useRouter } from 'next/router'

import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  Avatar,
  VStack,
  Text,
  MenuList,
  MenuItem,
  MenuDivider,
  Skeleton,
} from '@chakra-ui/react'
import IconArcaLogoHeader from '@/assets/arcaIcons/IconArcaLogoHeader'
import { FaMagic, FaSignOutAlt } from 'react-icons/fa'

import { useTranslation } from 'next-i18next'
import { FiChevronDown } from 'react-icons/fi'
import { signOut, useUserContext } from '@/hooks/useAuthUser'
import { useTaggyStore } from '@/store/taggyStore'
import MenuNavLink from './MenuNavLink'
import BadgedPlan from './BadgedPlan'

export default function NavBar() {
  const userContext = useUserContext()
  const user = userContext?.user
  const isLoading = userContext?.isLoading

  const setInitialState = useTaggyStore(state => state.setInitialState)

  const { t } = useTranslation()

  const { push, pathname } = useRouter()

  return (
    <Box
      id='arca-navbar'
      as='nav'
      width={['100%', '100%', '90%', '80%']}
      maxW={'1200px'}
      margin={'auto'}
      color={'taggyGray.100'}
      px={4}
    >
      <Flex
        h={14}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <HStack
          flex={1}
          spacing={4}
          alignItems={'center'}
        >
        <IconArcaLogoHeader width={'75px'} />
        </HStack>

        {pathname === '/freegeneration' ? (
          <Flex
            flex={1}
            gap={{ base: 2, md: 4 }}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            <Button
              gap={2}
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
              {t('buttons.createAccount')}
            </Button>
          </Flex>
        ) : (
          <Flex
            flex={1}
            gap={{ base: 2, md: 4 }}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            <Box display={{ base: 'none', md: 'flex' }}>
              <BadgedPlan
                plan={user?.dataCustomer?.product_name}
                loading={isLoading as boolean}
              />
            </Box>
            <Skeleton
              isLoaded={!isLoading}
              startColor='taggyGray.700'
              endColor='taggyGray.900'
              minWidth={{ base: '30px', md: '140px' }}
            >
              <HStack spacing={4}>
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
                          background={'taggyDark.300'}
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
                      <MenuNavLink handle={async () => await push('/app/profile')}>{t('buttons.profile')}</MenuNavLink>

                      <MenuNavLink handle={async () => await push('/app/account')}>{t('buttons.account')}</MenuNavLink>

                      <MenuDivider />

                      <MenuNavLink
                        handle={async () => {
                          setInitialState()
                          await signOut()
                        }}
                      >
                        <FaSignOutAlt />
                        {t('buttons.signout')}
                      </MenuNavLink>
                    </MenuList>
                  </Menu>
                </Flex>
              </HStack>
            </Skeleton>

            {pathname !== '/app/dashboard' && pathname !== '/generation' && pathname !== '/freegeneration' && (
              <Button
                gap={2}
                size={'sm'}
                fontSize={'sm'}
                fontWeight={'bold'}
                color={'taggyDark.50'}
                background={'#E0E0E0'}
                _hover={{ background: 'white' }}
                onClick={() => {
                  push('/app/dashboard')
                }}
              >
                <FaMagic fontSize={'0.8rem'} />
                {t('buttons.generate')}
              </Button>
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  )
}
