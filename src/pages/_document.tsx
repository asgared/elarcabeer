import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'

import { darkTheme } from '@/themes'
export default class Document extends NextDocument {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <meta
            name='apple-mobile-web-app-capable'
            content='yes'
          />
          <meta
            name='mobile-web-app-capable'
            content='yes'
          />
          <meta
            name='referrer'
            content='no-referrer'
          />
          <link
            rel='manifest'
            href='/manifest.json'
          />
          <link
            rel='apple-touch-icon'
            href='/icons/icon.png'
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
          <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5"/>
          <meta name="msapplication-TileColor" content="#da532c"/>
          <meta name="theme-color" content="#ffffff"></meta>
        </Head>
        <body>
          <ColorModeScript initialColorMode={darkTheme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
