export enum ImageStatus {
  READY = 'READY',
  UPLOADING = 'UPLOADING',
  SCANNING = 'SCANNING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum Actor {
  USER = 'USER',
  CREATOR = 'CREATOR',
  COMPANY = 'COMPANY',
}
export interface ActorValue {
  option: Actor
  value: string
}

export interface DetectionResult {
  secureUrl: string
  secureUrlPad?: string
  publicId: string
  categoryTags: Taggy[]
  categoryTopics: Taggy[]
  keyWords: Taggy[]
  keywordsDetected: string[]
}

export interface TaggyImages {
  ORIGINAL: string
  SQUARE: string
  SQUAREPAD: string
  SQUAREBLUR: string
  SQUAREBLURPAD: string
  VERTICAL: string
  VERTICALPAD: string
  VERTICALBLUR: string
  VERTICALBLURPAD: string
}

export interface TaggyImage {
  url: string
  type: TaggyImageType
}

export enum TaggyImageType {
  SQUARE = 'SQUARE',
  SQUAREPAD = 'SQUAREPAD',
  SQUAREBLUR = 'SQUAREBLUR',
  SQUAREBLURPAD = 'SQUAREBLURPAD',
  VERTICAL = 'VERTICAL',
  VERTICALPAD = 'VERTICALPAD',
  VERTICALBLUR = 'VERTICALBLUR',
  VERTICALBLURPAD = 'VERTICALBLURPAD',
  IMAGECROPPAD = 'IMAGECROPPAD',
  IMAGECROPPADBLUR = 'IMAGECROPPADBLUR',
}

export enum TaggyImageCropType {
  SQUARECROP = 'SQUARECROP',
  VERTICALCROP = 'VERTICALCROP',
}
export type ImageParams = Record<string, string>

export interface Tag {
  name?: string
  hashtag: string
  selected: boolean
}

export interface Topic {
  name: string
  hashtag: string
  selected: boolean
}

export interface Taggy {
  category: string
  tags: Tag[] | Topic[]
}

export type TaggyResponse = Record<string, Taggy[]>

export interface Community {
  regularUser: any[]
  contentCreator: any[]
  business: any[]
}

export interface VisionLabel {
  label: string
  score: number
}

export interface FeaturePrice {
  id: number | string
  feature: string
}

export interface Plan {
  id: string
  name: string
  price: number
  interval: string
  currency: string
  image: string
}

export interface Config {
  actor: Actor
  language: string
  personality: string
  feeling: string
  tweetFormat: boolean
  location: string
  occasion: string
  additionalContext: string
}

export interface Generation {
  id: number
  image_url: string
  caption: string
  created_at: string
  tags: string
  type_user_id: number
  favorite: boolean
  user_id: string
}
