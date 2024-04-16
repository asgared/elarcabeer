import { useState } from 'react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import { useTranslation } from 'next-i18next'
import useSelectedWordsAndTags from '@/hooks/useSelectedWordsAndTags'
import CaptionResult from './captionResult/CaptionResult'
import QuotesResult from './quotesResult/QuotesResult'

export default function TaggyTabs() {
  const [tabSelected, setTabSelected] = useState('CAPTION')

  const { t } = useTranslation()

  const { selectedWordsAndTags, textHashtags } = useSelectedWordsAndTags()

  return (
    <Tabs
      id='taggy-tabs'
      size='md'
      isFitted
      variant='enclosed'
      className='taggy-tabs'
    >
      <TabList>
        <Tab
          rounded={0}
          color='taggyDark.600'
          _selected={{ color: 'taggyText.900', bg: 'transparent' }}
          fontWeight={'bold'}
          borderRight={'0.5px solid'}
          borderRightColor={'whiteAlpha.300'}
          _hover={{ color: 'taggyText.900' }}
          onClick={() => {
            setTabSelected('CAPTION')
            window.localStorage.setItem('tab', 'CAPTION')
          }}
        >
          {t('buttons.caption')}
        </Tab>
        <Tab
          rounded={0}
          color='taggyDark.600'
          _selected={{ color: 'taggyText.900', bg: 'transparent' }}
          fontWeight={'bold'}
          borderLeft={'0.5px solid'}
          borderLeftColor={'whiteAlpha.300'}
          _hover={{ color: 'taggyText.900' }}
          onClick={() => {
            setTabSelected('QUOTES')
            window.localStorage.setItem('tab', 'QUOTES')
          }}
        >
          {t('buttons.quotes')}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
          padding={0}
          margin={0}
        >
          <CaptionResult
            textCaptionTags={textHashtags}
            selectedTags={selectedWordsAndTags}
            tabSelected={tabSelected}
          />
        </TabPanel>
        <TabPanel
          padding={0}
          margin={0}
        >
          <QuotesResult
            textCaptionTags={textHashtags}
            selectedTags={selectedWordsAndTags}
            tabSelected={tabSelected}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
