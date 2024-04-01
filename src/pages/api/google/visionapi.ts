import type { NextApiRequest, NextApiResponse } from 'next'

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

import path from 'path'
import { promises as fs } from 'fs'

import vision from '@google-cloud/vision'

const allowedOrigins = ['http://localhost:3000', 'https://www.taggy.com.mx', 'https://www.taggyai.com']

interface ReqData extends NextApiRequest {
  body: {
    imageUri: string
  }
}

interface ResData {
  success: boolean
  tags: Array<{ name: string; hashtag: string }>
  error?: { message: string }
}

export default async function handler(req: ReqData, res: NextApiResponse<ResData>) {
  const origin = req.headers.origin ?? ''
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).end('Forbidden')
  }

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed.')
  }

  const { imageUri } = req.body
  if (!imageUri) {
    return res.status(400).end('ImageUri required.')
  }

  const supabase = createPagesServerClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log({ session })

  if (!session) {
    res.status(401).end('not_authenticated')
    return
  }

  try {
    const jsonDirectory = path.join(process.cwd(), 'google-vision')
    const fileContents = await fs.readFile(jsonDirectory + '/taggy-vision-keys.json', 'utf8')
    const parsedData = JSON.parse(fileContents)

    const privateKey = process.env.GOOGLE_VISION_PRIVATE_KEY ?? ''

    const client = new vision.ImageAnnotatorClient({
      credentials: {
        ...parsedData,
        private_key_id: process.env.GOOGLE_VISION_PRIVATE_KEY_ID,
        private_key: privateKey.split(String.raw`\n`).join('\n'),
      },
    })

    const [result] = await client.annotateImage({
      features: [
        {
          maxResults: 25,
          type: 'LABEL_DETECTION',
        },
      ],
      image: {
        source: {
          imageUri,
        },
      },
    })

    const labels = result.labelAnnotations

    const response = labels?.map(la => {
      return { label: la.description, score: la.score }
    })

    res.status(200).json({
      success: true,
      tags:
        response?.map(l => ({
          name: l.label as string,
          hashtag: l.label ? l.label.replace(/\s/g, '').toLocaleLowerCase() : '',
        })) ?? [],
    })
  } catch (error) {
    console.error('Error al leer el archivo:', error)
    res.status(500).json({ success: false, tags: [] })
  }
}
