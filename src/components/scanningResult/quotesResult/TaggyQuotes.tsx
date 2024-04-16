import { useTranslation } from 'next-i18next'

import { Text, VStack, useMediaQuery, Textarea } from '@chakra-ui/react'

import animations from '@/styles/animations.module.css'

interface Props {
  showQuotes: boolean
  quotesStatus: string
  quotes: string
  autoFocus: boolean
  setQuotes: (value: { text: string; status: string }) => void
}

export default function TaggyQuotes({ showQuotes, quotesStatus, quotes, autoFocus, setQuotes }: Props) {
  const { t } = useTranslation()

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  if (!showQuotes) {
    return (
      <Text
        size={'sm'}
        color={'taggyPrimary.900'}
        mb={4}
      >
        {t('scanningResults.selectHashtags')}
      </Text>
    )
  }

  return (
    <>
      {quotesStatus === 'LOADING' ? (
        <VStack
          py={6}
          width={'full'}
        >
          <span className={`${animations.loader}`}></span>
        </VStack>
      ) : (
        <Textarea
          autoFocus={autoFocus}
          placeholder={t('scanningResults.quotesPlaceholder') ?? ''}
          _placeholder={{ color: 'taggyGray.100' }}
          size={'md'}
          rows={isDesktop ? 8 : 10}
          mb={4}
          onChange={e => {
            setQuotes({ status: quotesStatus, text: e.target.value })
          }}
        >
          {quotes}
        </Textarea>
      )}
    </>
  )
}
