import { useTranslation } from 'next-i18next'

import { Text, Textarea, VStack, useMediaQuery } from '@chakra-ui/react'

import animations from '@/styles/animations.module.css'
interface Props {
  showCaption: boolean
  captionStatus: string
  caption: string
  autoFocus: boolean
  setCaption: (value: { text: string; status: string }) => void
}

export default function TaggyCaption({ showCaption, captionStatus, caption, autoFocus, setCaption }: Props) {
  const { t } = useTranslation()

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  if (!showCaption) {
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
      {captionStatus === 'LOADING' ? (
        <VStack
          py={6}
          width={'full'}
        >
          <span className={`${animations.loader}`}></span>
        </VStack>
      ) : (
        <Textarea
          autoFocus={autoFocus}
          placeholder={t('scanningResults.captionPlaceholder') ?? ''}
          _placeholder={{ color: 'taggyGray.100' }}
          size={'md'}
          rows={isDesktop ? 8 : 10}
          mb={4}
          onChange={e => {
            setCaption({ status: captionStatus, text: e.target.value })
          }}
        >
          {caption}
        </Textarea>
      )}
    </>
  )
}
