import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ImageStatus } from '@/types.d'
import type { DetectionResult } from '@/types.d'
export interface State {
  imageStatus: ImageStatus
  detectionResult: DetectionResult
  caption: {
    text: string
    status: string
  }
  quotes: {
    text: string
    status: string
  }
  uploadId: string | null
}

const INITIAL_RESULT_STATE = {
  secureUrl: '',
  secureUrlPad: '',
  publicId: '',
  categoryTags: [],
  categoryTopics: [],
  keyWords: [],
  keywordsDetected: [],
}

const INITIAL_CAPTION_STATE = { text: '', status: 'DONE' }
const INITIAL_QUOTES_STATE = { text: '', status: 'DONE' }

const INITIAL_TAGGY_STATE = {
  imageStatus: ImageStatus.READY,
  detectionResult: INITIAL_RESULT_STATE,
  caption: INITIAL_CAPTION_STATE,
  quotes: INITIAL_QUOTES_STATE,
  uploadId: null,
}

interface Actions {
  setImageStatus: (value: ImageStatus) => void
  setDetectionResult: (value: DetectionResult) => void
  toggleTag: (category: string, tag: string) => void
  toggleKeyword: (tag: string) => void
  setCaption: (value: { text: string; status: string }) => void
  setQuotes: (value: { text: string; status: string }) => void
  setInitialState: () => void
  setUploadId: (value: string) => void
}

export const useTaggyStore = create(
  persist<State & Actions>(
    (set, get) => ({
      imageStatus: ImageStatus.READY,
      detectionResult: INITIAL_RESULT_STATE,
      caption: INITIAL_CAPTION_STATE,
      quotes: INITIAL_QUOTES_STATE,
      uploadId: null,
      setImageStatus: value => {
        set(() => ({ imageStatus: value }))
      },
      setDetectionResult: value => {
        set(() => ({ detectionResult: value }))
      },
      toggleTag: (category, tag) => {
        const detectionResult = get().detectionResult
        const updated = detectionResult.categoryTags.map(categoryTag => {
          if (categoryTag.category === category) {
            const updated = categoryTag.tags.map(t => {
              if (t.hashtag === tag) {
                return { ...t, selected: !t.selected }
              }
              return t
            })

            return { ...categoryTag, tags: updated }
          }
          return categoryTag
        })

        set(state => ({
          detectionResult: { ...state.detectionResult, categoryTags: updated },
        }))
      },
      toggleKeyword: tag => {
        const detectionResult = get().detectionResult
        const updated = detectionResult.keyWords[0].tags.map(keyword => {
          if (keyword.hashtag === tag) return { ...keyword, selected: !keyword.selected }
          return keyword
        })

        const keyWords = detectionResult.keyWords
        keyWords[0].tags = updated

        set(state => ({
          detectionResult: { ...state.detectionResult, keyWords },
        }))
      },
      setCaption: value => {
        set(() => ({ caption: value }))
      },
      setQuotes: value => {
        set(() => ({ quotes: value }))
      },
      setInitialState: () => {
        set(() => ({ ...INITIAL_TAGGY_STATE }))
        localStorage.removeItem('captionHistory')
        localStorage.removeItem('quotesHistory')
      },
      setUploadId: value => {
        set(() => ({ uploadId: value }))
      },
    }),
    {
      name: 'taggy-storage',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          persistedState = persistedState
        }

        return persistedState as State & Actions
      },
    }
  )
)
