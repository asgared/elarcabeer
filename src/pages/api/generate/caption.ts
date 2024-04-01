import type { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, ChatCompletionRequestMessageRoleEnum, OpenAIApi } from 'openai'

import {
  getSystemMessageGenerate,
  getExampleMessagesGenerateCaption,
  getSystemMessageRulesCaption,
} from '@/data/prompts'
import type { Config } from '@/types.d'

interface ResData {
  success: boolean
  caption: string | null
  message?: string
  error?: { message: string }
}

interface ReqData extends NextApiRequest {
  body: {
    tags: string[]
    config: Config
  }
}

export default async function handler(req: ReqData, res: NextApiResponse<ResData>) {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      caption: null,
      error: {
        message: 'Method not allowed.',
      },
    })
  }

  const { tags, config } = req.body

  if (!tags || !Array.isArray(tags)) {
    res.status(400).json({
      success: false,
      caption: null,
      error: {
        message: 'Tags not found or its type is invalid.',
      },
    })
  }

  try {
    const configuration = new Configuration({ apiKey: process.env.OPENIA_AUTH })
    const openai = new OpenAIApi(configuration)

    const prompt = `Keywords: "${tags.join(', ')}"
    Language: "${config.language}"
    Personality: "${config.personality}"
    Feeling: "${config.feeling}"
    Location: "${config.location}"
    Occasion: "${config.occasion}"
    Additional context: "${config.additionalContext}"
    `
    console.log({ prompt })

    const SYSTEM_MESSAGE_GENERATE_CAPTION = getSystemMessageGenerate(config.actor)
    const SYSTEM_MESSAGE_GENERATE_CAPTION_RULES = getSystemMessageRulesCaption(config.actor)
    const EXAMPLE_MESSAGES_GENERATE_CAPTION = getExampleMessagesGenerateCaption(config.actor)

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      max_tokens: 400,
      temperature: 0.9,
      messages: [
        SYSTEM_MESSAGE_GENERATE_CAPTION,
        ...SYSTEM_MESSAGE_GENERATE_CAPTION_RULES,
        ...EXAMPLE_MESSAGES_GENERATE_CAPTION,
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: prompt,
        },
      ],
    })

    const resp = completion.data.choices[0].message?.content ?? ''

    res.status(200).json({
      success: true,
      caption: resp,
    })
    return
  } catch (error) {
    console.log({ error })
    res.status(200).json({
      success: false,
      caption: null,
      error: {
        message: 'Oops! We are experiencing an excess of requests, please try again',
      },
    })
  }
}
