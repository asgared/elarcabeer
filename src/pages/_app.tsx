import type { AppProps } from 'next/app'

import { appWithTranslation } from 'next-i18next'

import { ChakraProvider } from '@chakra-ui/react'
import { darkTheme } from '@/themes'

import { UserProvider } from '@/context/user'

import '../styles/globals.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ChakraProvider theme={darkTheme}>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ChakraProvider>
  )
}

export default appWithTranslation(App)
