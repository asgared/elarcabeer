import { Card, CardBody, CardHeader, useMediaQuery } from '@chakra-ui/react'
import TaggyTagKeword from './TaggyTagKeword'

import styles from '@/styles/category-titles.module.css'
import { useTaggyStore } from '@/store/taggyStore'

export default function TagListKeywords() {
  const detectionResult = useTaggyStore(state => state.detectionResult)
  const data = detectionResult?.keyWords?.[0]
  if (data?.tags.length === 0) return null

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  return (
    <Card
      bg={'taggyDark.50'}
      border={'1px'}
      borderColor={'taggyDark.300'}
    >
      <>
        <CardHeader
          as='h3'
          className={`${styles.topkeywords}`}
          textTransform={'capitalize'}
          fontWeight={'bold'}
          p={`${isDesktop ? 6 : 4}`}
          pb={0}
        >
          Top Keywords detected
        </CardHeader>
        <CardBody p={`${isDesktop ? 6 : 4}`}>
          {data?.tags.map((tag, index) => (
            <TaggyTagKeword
              key={tag.hashtag}
              category={data.category}
              tag={tag.hashtag}
              name={tag.name as string}
              enabled={tag.selected}
              noToggled={index <= 2}
            />
          ))}
        </CardBody>
      </>
    </Card>
  )
}
