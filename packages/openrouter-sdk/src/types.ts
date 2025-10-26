import { z } from "zod"

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  contextLength: z.number(),
  pricing: z.object({
    prompt: z.number(), // per 1M tokens
    completion: z.number(), // per 1M tokens
  }),
  topProvider: z.string().optional(),
})

export type Model = z.infer<typeof ModelSchema>

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
})

export type Message = z.infer<typeof MessageSchema>

export const ChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(MessageSchema),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stream: z.boolean().default(false),
})

export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>

export const ChatCompletionChunkSchema = z.object({
  id: z.string(),
  model: z.string(),
  created: z.number(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: z.object({
        role: z.string().optional(),
        content: z.string().optional(),
      }),
      finishReason: z.string().nullable(),
    }),
  ),
})

export type ChatCompletionChunk = z.infer<typeof ChatCompletionChunkSchema>

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  created: z.number(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: MessageSchema,
      finishReason: z.string(),
    }),
  ),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
})

export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>

export interface OpenRouterConfig {
  apiKey: string
  baseURL?: string
  defaultModel?: string
  siteUrl?: string
  siteName?: string
  maxRetries?: number
  timeout?: number
}

export interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  byModel: Record<
    string,
    {
      requests: number
      tokens: number
      cost: number
    }
  >
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "OpenRouterError"
  }
}
