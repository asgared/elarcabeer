import { useTranslation } from 'next-i18next'

import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'

import GridGenerations from './GridGenerations'
import { type Generation } from '@/types'
import GridCommunity from './GridCommunity'

interface Props {
  generations: Generation[]
  community: Generation[]
}

export default function TabsGenerations({ generations, community }: Props) {
  const { t } = useTranslation('profile')

  return (
    <Tabs
      id='taggy-tabs'
      size='md'
      variant='enclosed'
      width={'full'}
    >
      <TabList>
        <Tab
          rounded={0}
          color='taggyDark.600'
          _selected={{ color: 'taggyText.900', bg: 'transparent' }}
          borderRight={'0.5px solid'}
          fontWeight={'bold'}
          borderRightColor={'whiteAlpha.300'}
          _hover={{ color: 'taggyText.900' }}
        >
          {t('buttons.mygenerations')}
        </Tab>
        <Tab
          rounded={0}
          color='taggyDark.600'
          _selected={{ color: 'taggyText.900', bg: 'transparent' }}
          borderLeft={'0.5px solid'}
          fontWeight={'bold'}
          borderLeftColor={'whiteAlpha.300'}
          _hover={{ color: 'taggyText.900' }}
        >
          {t('buttons.community')}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
          px={{ base: 0, md: 6 }}
          py={6}
        >
          {generations.length ? (
            <GridGenerations generations={generations} />
          ) : (
            <Text
              fontSize={'sm'}
              color={'taggyGray.100'}
            >
              {t('myGenerationsMsg')}
            </Text>
          )}
        </TabPanel>
        <TabPanel
          px={{ base: 0, md: 6 }}
          py={6}
        >
          {community.length ? (
            <GridCommunity community={community} />
          ) : (
            <Text
              fontSize={'sm'}
              color={'taggyGray.100'}
            >
              {t('communityMsg')}
            </Text>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
