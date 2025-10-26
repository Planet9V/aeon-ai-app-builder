import type { Model } from "./types"

export const MODELS: Record<string, Model> = {
  // OpenAI Models
  "openai/gpt-4-turbo": {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Most capable GPT-4 model, 128k context",
    contextLength: 128000,
    pricing: {
      prompt: 10.0,
      completion: 30.0,
    },
    topProvider: "OpenAI",
  },
  "openai/gpt-4": {
    id: "openai/gpt-4",
    name: "GPT-4",
    description: "Previous generation GPT-4, 8k context",
    contextLength: 8192,
    pricing: {
      prompt: 30.0,
      completion: 60.0,
    },
    topProvider: "OpenAI",
  },
  "openai/gpt-3.5-turbo": {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and efficient, 16k context",
    contextLength: 16384,
    pricing: {
      prompt: 0.5,
      completion: 1.5,
    },
    topProvider: "OpenAI",
  },

  // Anthropic Models
  "anthropic/claude-3-opus": {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Most capable Claude model, 200k context",
    contextLength: 200000,
    pricing: {
      prompt: 15.0,
      completion: 75.0,
    },
    topProvider: "Anthropic",
  },
  "anthropic/claude-3-sonnet": {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    description: "Balanced performance and speed, 200k context",
    contextLength: 200000,
    pricing: {
      prompt: 3.0,
      completion: 15.0,
    },
    topProvider: "Anthropic",
  },
  "anthropic/claude-3-haiku": {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Fastest Claude model, 200k context",
    contextLength: 200000,
    pricing: {
      prompt: 0.25,
      completion: 1.25,
    },
    topProvider: "Anthropic",
  },

  // Google Models
  "google/gemini-pro": {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    description: "Google's multimodal AI, 32k context",
    contextLength: 32760,
    pricing: {
      prompt: 0.5,
      completion: 1.5,
    },
    topProvider: "Google",
  },

  // Meta Models
  "meta-llama/llama-3-70b-instruct": {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    description: "Open-source model from Meta, 8k context",
    contextLength: 8192,
    pricing: {
      prompt: 0.59,
      completion: 0.79,
    },
    topProvider: "Meta",
  },

  // Mistral Models
  "mistralai/mixtral-8x7b-instruct": {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    description: "Mixture of experts model, 32k context",
    contextLength: 32768,
    pricing: {
      prompt: 0.24,
      completion: 0.24,
    },
    topProvider: "Mistral AI",
  },
}

export const DEFAULT_MODEL = "anthropic/claude-3-sonnet"

export function getModel(modelId: string): Model | undefined {
  return MODELS[modelId]
}

export function getAllModels(): Model[] {
  return Object.values(MODELS)
}

export function getModelsByProvider(provider: string): Model[] {
  return getAllModels().filter((m) => m.topProvider === provider)
}

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const modelInfo = getModel(model)
  if (!modelInfo) return 0

  const promptCost = (promptTokens / 1_000_000) * modelInfo.pricing.prompt
  const completionCost = (completionTokens / 1_000_000) * modelInfo.pricing.completion

  return promptCost + completionCost
}
