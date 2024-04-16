import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'

import { Alert, AlertIcon, Box, Flex, Text, VStack } from '@chakra-ui/react'
// import { TaggyCopyToClipboard } from '@/components/ui'
import TaggyQuotes from './TaggyQuotes'

// import IconTaggyReload from '../../../assets/taggyIcons/IconTaggyReload'

import { useTaggyStore } from '@/store/taggyStore'
import { getQuotesByTags } from '@/services/cloudinary'
// import ButtonTaggy from '@/components/ui/ButtonTaggy'
import { updateGenerations } from '@/utils/supabase-db'
import LocalHistory from '../LocalHistory'
import { updateLocalHIstory } from '@/utils/generation-utils'
import PreviewCard from '../PreviewCard'
import { useConfigStore } from '@/store/configStore'
import { useUserContext } from '@/hooks/useAuthUser'
import { supabase } from '@/utils/supabase-client'

interface Props {
  selectedTags: string[]
  textCaptionTags: string
  tabSelected: string
}

export default function QuotesResult({ selectedTags, textCaptionTags, tabSelected }: Props) {
  const [autoFocus, setAutoFocus] = useState(false)
  const [showError, setShowError] = useState(false)

  const { quotes, setQuotes, uploadId } = useTaggyStore(state => state)
  const config = useConfigStore(state => state.config)

  const userContext = useUserContext()
  const user = userContext?.user

  const { t } = useTranslation()

  const updateCredits = async () => {
    await supabase
      .from('profiles')
      .update({ credits: user.credits - 1 })
      .eq('id', user.id)
  }

  const setQuotesResult = async (resp: any) => {
    if (resp.success) {
      setQuotes({ text: resp.caption, status: 'DONE' })
      updateGenerations(uploadId as string)

      if (!user.is_subscribed) updateCredits()

      updateLocalHIstory(tabSelected, resp.caption, selectedTags)
      setAutoFocus(true)
    } else if (resp.error) {
      setQuotes({ text: resp.error.message, status: 'DONE' })
    }
  }

  const getQuotes = async () => {
    if (selectedTags.length < 3 || (user.credits < 1 && !user.is_subscribed)) return null

    setQuotes({ ...quotes, status: 'LOADING' })
    setShowError(false)

    let retries = 0

    while (retries < 3) {
      try {
        const respCaption = await getQuotesByTags(selectedTags, config)
        setQuotesResult(respCaption)
        return
      } catch (error) {
        retries++
      }
    }

    setQuotes({ text: '', status: 'DONE' })
    setShowError(true)
  }

  const getactor = () => {
    if (config.actor === 'COMPANY') return 'Company'
    if (config.actor === 'CREATOR') return 'Content creator'
    return 'Regular user'
  }

  return (
    <VStack
      gap={6}
      mt={4}
      mb={6}
    >
      <Box
        id='taggy-text-generated'
        w={'full'}
      >
        <VStack
          id='config-saved-container'
          alignItems={'flex-start'}
        >
          <Text
            mb={4}
            fontSize={'sm'}
            color={'taggyGray.100'}
          >
            {t('scanningResults.actingAs')} {getactor()}
          </Text>
        </VStack>
        <TaggyQuotes
          showQuotes={selectedTags.length >= 3}
          quotesStatus={quotes.status}
          quotes={quotes.text}
          autoFocus={autoFocus}
          setQuotes={setQuotes}
        />

        <Text
          textAlign={'left'}
          width={'full'}
          mb={4}
        >
          {textCaptionTags}
        </Text>
      </Box>

      {/* <Flex
        id='taggy-regenerate-buttons'
        justifyContent={'space-between'}
        alignItems={'center'}
        w={'full'}
        mb={4}
      >
        <Flex gap={2}>
          <ButtonTaggy
            id={'reload-quotes'}
            handleClick={getQuotes}
            disabled={user.credits < 1 && !user.is_subscribed}
          >
            <IconTaggyReload
              width={'1rem'}
              color='#1a1a1a'
            />
            {t('buttons.reloadQuotes')}
          </ButtonTaggy>

          <PreviewCard
            typeText='quotes'
            text={quotes.text}
            tags={textCaptionTags}
          />
        </Flex>

        <TaggyCopyToClipboard
          text={quotes.text}
          tags={textCaptionTags}
        />
      </Flex> */}

      {showError && (
        <Alert status='error'>
          <AlertIcon />
          Oops! We are experiencing an excess of requests, please try again.
        </Alert>
      )}

      {user.credits < 1 && !user.is_subscribed && (
        <Alert status='warning'>
          <AlertIcon />
          {t('warningCredits')}{' '}
          <NextLink href='/pricing'>
            <Text
              ml={2}
              textDecor={'underline'}
            >
              {t('upgradePlan')}
            </Text>
          </NextLink>
        </Alert>
      )}
      <LocalHistory
        tab={tabSelected}
        newCaption={quotes.text}
      />
    </VStack>
  )
}
