import { useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Alert, AlertIcon, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'

import IconTaggyReload from '../../../assets/taggyIcons/IconTaggyReload'

import { useTaggyStore } from '@/store/taggyStore'
import { getCaptionByTags, getCaptionTweetByTags } from '@/services/cloudinary'
import ButtonTaggy from '@/components/ui/ButtonTaggy'
import { updateGenerations } from '@/utils/supabase-db'
import LocalHistory from '../LocalHistory'
import { updateLocalHIstory } from '@/utils/generation-utils'
import PreviewCard from '../PreviewCard'
import TaggyCaption from './TaggyCaption'
import { TaggyCopyToClipboard } from '@/components/ui'
import { useConfigStore } from '@/store/configStore'
import { useUserContext } from '@/hooks/useAuthUser'
import { supabase } from '@/utils/supabase-client'
import NextLink from 'next/link'

interface Props {
  selectedTags: string[]
  textCaptionTags: string
  tabSelected: string
}

export default function CaptionResult({ selectedTags, textCaptionTags, tabSelected }: Props) {
  const [autoFocus, setAutoFocus] = useState(false)
  const [showError, setShowError] = useState(false)

  const { caption, uploadId, setCaption } = useTaggyStore(state => state)
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

  const setCaptionResult = (resp: any) => {
    if (resp.success) {
      setCaption({ text: resp.caption, status: 'DONE' })
      updateGenerations(uploadId as string)

      if (!user.is_subscribed) updateCredits()

      updateLocalHIstory(tabSelected, resp.caption, selectedTags)
      setAutoFocus(true)
    } else if (resp.error) {
      setCaption({ text: resp.error.message, status: 'DONE' })
    }
  }

  const getCaption = async () => {
    if (selectedTags.length < 3 || (user.credits < 1 && !user.is_subscribed)) return null

    setCaption({ ...caption, status: 'LOADING' })
    setShowError(false)
    let retries = 0

    if (config.tweetFormat) {
      while (retries < 3) {
        try {
          const respCaption = await getCaptionTweetByTags(selectedTags, config)
          setCaptionResult(respCaption)
          return
        } catch (error) {
          retries++
        }
      }
    } else {
      while (retries < 3) {
        try {
          const respCaption = await getCaptionByTags(selectedTags, config)
          setCaptionResult(respCaption)
          return
        } catch (error) {
          retries++
        }
      }
    }

    setCaption({ text: '', status: 'DONE' })
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
          <HStack gap={4}>
            <Text
              mb={4}
              fontSize={'sm'}
              color={'taggyGray.100'}
            >
              {t('scanningResults.actingAs')} {getactor()}
            </Text>
            {config.tweetFormat && (
              <Text
                mb={4}
                fontSize={'sm'}
                color={'taggyGray.100'}
              >
                {t('scanningResults.tweetFormat')}
              </Text>
            )}
          </HStack>
        </VStack>
        <TaggyCaption
          showCaption={selectedTags.length >= 3}
          captionStatus={caption.status}
          caption={caption.text}
          autoFocus={autoFocus}
          setCaption={setCaption}
        />

        <Text
          textAlign={'left'}
          width={'full'}
          mb={4}
        >
          {textCaptionTags}
        </Text>
      </Box>

      <Flex
        id='taggy-regenerate-buttons'
        justifyContent={'space-between'}
        alignItems={'center'}
        w={'full'}
        mb={4}
      >
        <Flex gap={{ base: 1, lg: 2 }}>
          <ButtonTaggy
            id={'reload-quotes'}
            handleClick={getCaption}
            disabled={user.credits < 1 && !user.is_subscribed}
          >
            <IconTaggyReload
              width={'1rem'}
              color='#111'
            />
            {t('buttons.reloadCaption')}
          </ButtonTaggy>

          <PreviewCard
            typeText='caption'
            text={caption.text}
            tags={textCaptionTags}
          />
        </Flex>

        <TaggyCopyToClipboard
          text={caption.text}
          tags={textCaptionTags}
          type='caption'
        />
      </Flex>

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
        newCaption={caption.text}
      />
    </VStack>
  )
}
