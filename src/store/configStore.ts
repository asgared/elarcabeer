import { create } from 'zustand'

import { Actor, type Config } from '@/types.d'

const INITIAL_CONFIG_STATE = {
  actor: Actor.USER,
  language: 'English',
  personality: 'Neutral',
  feeling: 'Neutral',
  tweetFormat: false,
  location: '',
  occasion: '',
  additionalContext: '',
}

export interface State {
  config: Config
}

interface Actions {
  setConfig: (value: Record<string, unknown>) => void
  setInitialState: () => void
}

export const useConfigStore = create<State & Actions>()(set => ({
  config: INITIAL_CONFIG_STATE,
  setConfig: value => {
    set(state => ({ config: { ...state.config, ...value } }))
  },
  setInitialState: () => {
    set({ config: INITIAL_CONFIG_STATE })
  },
}))
