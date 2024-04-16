import { useTranslation } from 'next-i18next'
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Flex } from '@chakra-ui/react'
import { FaTag } from 'react-icons/fa'

import CategorizationResult from './CategorizationResult'

export default function CategorizationResultMobile() {
  const { t } = useTranslation()

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
              gap={2}
              alignItems={'center'}
            >
              <FaTag fontSize={'0.8rem'} />
              {t('buttons.keyWordsAndHashtags')}
            </Flex>
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel
          id='taggy-edit-image__acordion-content'
          p={0}
          px={0}
        >
          <CategorizationResult />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
