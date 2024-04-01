import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

import { Box, Divider, Text, Flex } from '@chakra-ui/react'

import { supabase } from '@/utils/supabase-client'

export default function AuthForm() {
  const router = useRouter()

  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)

  useEffect(() => {
    setCallbackUrl(`${window.location.origin}/api/auth/callback`)
  }, [router.pathname])

  if (!callbackUrl) return null
  return (
    <Box w='xs'>
      <Auth
        supabaseClient={supabase}
        providers={['google']}
        view='sign_in'
        appearance={{
          theme: ThemeSupa,
        }}
        theme='dark'
        redirectTo={callbackUrl}
        onlyThirdPartyProviders={true}
      />
      <Flex
        padding='4'
        gap={4}
        alignItems={'center'}
      >
        <Divider />
        <Text
          fontSize={'sm'}
          color={'taggyDark.600'}
        >
          Or
        </Text>
        <Divider />
      </Flex>
      <Box mb={8}>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          view='magic_link'
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(255, 51, 133,0.4)',
                  brandAccent: 'rgb(255, 51, 133)',
                },
              },
            },
          }}
          theme='dark'
          redirectTo={callbackUrl}
          magicLink
          showLinks={false}
        />
      </Box>
    </Box>
  )
}
