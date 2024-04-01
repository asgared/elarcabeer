// import { useState } from 'react'

// import Link from 'next/link'
// import { useTranslation } from 'next-i18next'
// import { useRouter } from 'next/router'

import { Box } from '@chakra-ui/react'
import NavBarLanding from './NavBarLanding'
import NavBar from './NavBar'

// import { FaTimes } from 'react-icons/fa'

// import { useTaggyStore } from '@/store/taggyStore'

interface Props {
  typeNav: 'landing' | 'app'
}

export default function Header({ typeNav }: Props) {
  // const imageStatus = useTaggyStore(state => state.imageStatus)

  // const { t } = useTranslation()

  // const { route } = useRouter()

  // const [showBuyMeAAcoffe, setShowBuyMeAAcoffe] = useState(true)

  const renderNav = () => {
    if (typeNav === 'landing') {
      return <NavBarLanding />
    } else if (typeNav === 'app') {
      return <NavBar />
    }
  }

  return (
    <Box
      as='header'
      zIndex={100}
      w={'full'}
      pos={'sticky'}
      top={0}
      borderBottom={'1px'}
      borderBottomColor={'taggyDark.300'}
      sx={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* {showBuyMeAAcoffe && imageStatus === 'READY' && route === '/generation' && (
        <>
          <Flex
            pt={2}
            px='4'
            bg={'black'}
            w={'black'}
            justifyContent={'flex-end'}
          >
            <FaTimes
              onClick={() => {
                setShowBuyMeAAcoffe(false)
              }}
            />
          </Flex>
          <Flex
            w={'full'}
            gap={4}
            bg={'black'}
            p={2}
            pt={0}
            fontSize={'sm'}
            alignItems={'center'}
            justifyContent={'center'}
            flexDir={{ base: 'column', lg: 'row' }}
          >
            <Text>{t('buyMeAAcoffe')}</Text>
            <Link
              href='https://www.buymeacoffee.com/ljaviertovar'
              target='_blank'
              passHref
            >
              <Image
                src='https://cdn.buymeacoffee.com/buttons/v2/default-blue.png'
                alt='Buy Me A Coffee'
                width={'140px'}
              />
            </Link>
          </Flex>
        </>
      )} */}

      {renderNav()}
    </Box>
  )
}
