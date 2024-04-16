import {
  useMediaQuery,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
} from '@chakra-ui/react'
import TaggyTag from './TaggyTag'

import styles from '@/styles/category-titles.module.css'
import { useTaggyStore } from '@/store/taggyStore'

export default function TagList() {
  const detectionResult = useTaggyStore(state => state.detectionResult)
  const data = detectionResult?.categoryTags

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  const makeClassCat = (cat: string) => {
    return cat.toLowerCase().trim().replace(/\s/g, '')
  }

  return (
    <Accordion
      id='taggy-categorization__container'
      allowMultiple
      defaultIndex={[0, 1]}
    >
      {data.map(el => {
        const cat = el.category

        return (
          <AccordionItem
            key={el.category}
            bg={'taggyDark.50'}
            rounded={6}
            border={'1px'}
            borderColor={'taggyDark.300'}
            mb={4}
            p={`${isDesktop ? 6 : 4}`}
          >
            <AccordionButton
              as='h3'
              className={`${styles[makeClassCat(cat)]}`}
              textTransform={'capitalize'}
              fontWeight={'bold'}
              p={0}
              _hover={{ cursor: 'pointer' }}
            >
              <Flex
                w={'full'}
                justifyContent={'space-between'}
                pl={2}
              >
                {cat}
                <AccordionIcon />
              </Flex>
            </AccordionButton>

            <AccordionPanel
              px={0}
              pt={`${isDesktop ? 6 : 4}`}
              pb={0}
            >
              {el.tags.map(tag => (
                <TaggyTag
                  key={tag.name}
                  category={el.category}
                  tag={tag.hashtag}
                  enabled={tag.selected}
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
