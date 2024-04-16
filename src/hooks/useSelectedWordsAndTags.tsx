import { useMemo } from 'react'

import { useTaggyStore } from '@/store/taggyStore'

export default function useSelectedWordsAndTags() {
  const detectionResult = useTaggyStore(state => state.detectionResult)

  // const textHashtags: string = useMemo(() => {
  //   let text = ''

  //   for (const category of detectionResult.keyWords) {
  //     for (const tag of category.tags) {
  //       if (tag.selected) {
  //         text += `#${tag.hashtag} `
  //       }
  //     }
  //   }

  //   for (const category of detectionResult.categoryTags) {
  //     for (const tag of category.tags) {
  //       if (tag.selected) {
  //         text += `#${tag.hashtag} `
  //       }
  //     }
  //   }

  //   text = text.trim()
  //   const uniqueString = [...new Set(text.split(' '))].join(' ')

  //   return uniqueString
  // }, [detectionResult])

  // const selectedWordsAndTags: string[] = useMemo(() => {
  //   const tags = []

  //   for (const category of detectionResult.keyWords) {
  //     for (const tag of category.tags) {
  //       if (tag.selected) {
  //         tags.push(tag.hashtag)
  //       }
  //     }
  //   }

  //   for (const category of detectionResult.categoryTags) {
  //     for (const tag of category.tags) {
  //       if (tag.selected) {
  //         tags.push(tag.hashtag)
  //       }
  //     }
  //   }

  //   const uniqueString = [...new Set(tags)]

  //   return Array.from(uniqueString)
  // }, [detectionResult])

  // return { textHashtags, selectedWordsAndTags }
}
