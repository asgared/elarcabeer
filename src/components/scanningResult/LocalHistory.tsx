import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Text,
  Textarea,
} from '@chakra-ui/react'

import TaggyCopyToClipboardSimple from '../ui/TaggyCopyToClipboardSimple'

import { MdHistory } from 'react-icons/md'
interface Props {
  tab: string
  newCaption: string
}

export default function LocalHistory({ tab, newCaption }: Props) {
  const [history, setHistory] = useState<Array<{ id: string; text: string }>>([])

  const { t } = useTranslation()

  useEffect(() => {
    const localHistory = JSON.parse(
      localStorage.getItem(tab === 'CAPTION' ? 'captionHistory' : 'quotesHistory') ?? '[]'
    )
    localHistory.pop()
    localHistory.reverse()
    setHistory(localHistory)
  }, [newCaption, tab])

  return (
    <Accordion
      id='taggy-keywords-hashtags__container'
      allowMultiple
      w={'full'}
    >
      <AccordionItem>
        <AccordionButton
          id='taggy-result-controls__acordion-button'
          px={0}
          fontSize={'md'}
          fontWeight={'bold'}
        >
          <Box
            as='span'
            flex='2'
            textAlign='left'
          >
            <Flex
              gap={1}
              alignItems={'center'}
            >
              <MdHistory fontSize={'1rem'} />
              {tab === 'CAPTION' ? t('buttons.myCaptionsGenerated') : t('buttons.myQuotesGenerated')}
            </Flex>
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel
          id='taggy-history-content'
          p={0}
        >
          <Box>
            {history.length === 0 && (
              <Text
                py={4}
                color={'taggyGray.100'}
                fontSize={'sm'}
              >
                {tab === 'CAPTION' ? t('scanningResults.msgHistoryCaptions') : t('scanningResults.msgHistoryQuotes')}
              </Text>
            )}
            {history.map(text => (
              <Box
                key={text.id}
                my={4}
              >
                <Textarea
                  id={`history${tab}Text${text.id}`}
                  size={'md'}
                  rows={6}
                  mb={1}
                >
                  {text.text}
                </Textarea>
                <HStack justifyContent={'flex-end'}>
                  <TaggyCopyToClipboardSimple
                    id={`history${tab}Text${text.id}`}
                    text={text.text}
                    buttonText={t('buttons.copyToClipboard')}
                  />
                </HStack>
              </Box>
            ))}
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
