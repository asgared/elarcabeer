import axios from 'axios'
import { type ImageParams, type Config } from '../types'

export const scanningAndCategorization = async (secure_url: string) => {
  const categorizationResult = await axios({
    method: 'POST',
    url: '/api/google/visionapi',
    data: {
      imageUri: secure_url,
    },
  })

  const taggyResult = await axios({
    method: 'POST',
    url: '/api/taggy',
    data: {
      tagsDetected: categorizationResult.data.tags,
    },
  })

  return {
    taggyCategorization: taggyResult.data,
  }
}

export const getCaptionByTags = async (tags: string[], config: Config) => {
  try {
    const resp = await axios({
      method: 'POST',
      url: '/api/generate/caption',
      data: {
        tags,
        config,
      },
      timeout: 10000,
    })

    return resp.data
  } catch (error: any) {
    throw new Error('Error de timeout')
  }
}

export const getCaptionTweetByTags = async (tags: string[], config: Config) => {
  const resp = await axios({
    method: 'POST',
    url: '/api/generate/captionTweet',
    data: {
      tags,
      config,
    },
    timeout: 10000,
  })

  return resp.data
}

export const getQuotesByTags = async (tags: string[], config: Config) => {
  const resp = await axios({
    method: 'POST',
    url: '/api/generate/quotes',
    data: {
      tags,
      config,
    },
    timeout: 10000,
  })

  return resp.data
}

export const taggyParams = (): ImageParams => {
  return {
    SQUARE: 'q_auto:best,f_jpg,w_1080,h_1080,c_fill,g_auto,ar_1:1',
    SQUAREPAD: 'q_auto:best,f_jpg,w_1080,h_1080,c_pad,b_auto:predominant,ar_1:1',
    SQUAREBLUR: 'q_auto:best,f_jpg,w_1080,h_1080,c_fill,g_auto,ar_1:1,e_blur:1000',
    SQUAREBLURPAD: 'q_auto:best,f_jpg,w_1080,h_1080,c_pad,b_auto:predominant,ar_1:1,e_blur:1000',
    VERTICAL: 'q_auto:best,f_jpg,w_1080,h_1350,c_fill,g_auto,ar_4:5',
    VERTICALPAD: 'q_auto:best,f_jpg,w_1080,h_1350,c_pad,b_auto:predominant,ar_4:5',
    VERTICALBLUR: 'q_auto:best,f_jpg,w_1080,h_1350,c_fill,g_auto,ar_4:5,e_blur:1000',
    VERTICALBLURPAD: 'q_auto:best,f_jpg,w_1080,h_1350,c_pad,b_auto:predominant,ar_4:5,e_blur:1000',
    IMAGECROPPAD: 'q_auto:best,f_jpg,w_1080,h_1350,c_pad,b_black,ar_4:5',
    IMAGECROPPADBLUR: 'q_auto:best,f_jpg,w_1080,h_1350,c_pad,b_black,ar_4:5,e_blur:1000',
  }
}

export function validateTypeObjects(obj1: any, obj2: any): boolean {
  // Obtener las claves de propiedades de ambos objetos
  const keysObj1 = Object.keys(obj1)
  const keysObj2 = Object.keys(obj2)

  // Comparar la longitud de las claves de propiedades
  if (keysObj1.length !== keysObj2.length) {
    return false
  }

  // Comparar los tipos de las propiedades
  for (const key of keysObj1) {
    if (typeof obj1[key] !== typeof obj2[key]) {
      return false
    }
  }

  // Si no se encontraron diferencias, entonces los objetos tienen los mismos tipos
  return true
}
