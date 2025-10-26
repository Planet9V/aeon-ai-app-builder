import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AIModel {
  id: string
  name: string
  provider: string
  contextSize: number
  pricing: {
    prompt: number
    completion: number
  }
}

export interface AISettings {
  apiKey: string
  defaultModel: string
  temperature: number
  maxTokens: number
  streamResponses: boolean
}

export interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  requestsByModel: Record<string, number>
  tokensByModel: Record<string, number>
}

interface AIState {
  settings: AISettings
  availableModels: AIModel[]
  selectedModel: string
  usageStats: UsageStats

  updateSettings: (settings: Partial<AISettings>) => void
  setApiKey: (apiKey: string) => void
  setSelectedModel: (modelId: string) => void
  updateUsageStats: (tokens: number, cost: number, model: string) => void
  resetUsageStats: () => void
  isConfigured: () => boolean
}

const defaultModels: AIModel[] = [
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    contextSize: 200000,
    pricing: { prompt: 15, completion: 75 },
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    contextSize: 200000,
    pricing: { prompt: 3, completion: 15 },
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    contextSize: 200000,
    pricing: { prompt: 0.25, completion: 1.25 },
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextSize: 128000,
    pricing: { prompt: 10, completion: 30 },
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextSize: 128000,
    pricing: { prompt: 5, completion: 15 },
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    contextSize: 128000,
    pricing: { prompt: 0.15, completion: 0.6 },
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "Google",
    contextSize: 1000000,
    pricing: { prompt: 3.5, completion: 10.5 },
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "Meta",
    contextSize: 128000,
    pricing: { prompt: 0.88, completion: 0.88 },
  },
  {
    id: "mistralai/mixtral-8x22b-instruct",
    name: "Mixtral 8x22B",
    provider: "Mistral AI",
    contextSize: 64000,
    pricing: { prompt: 1.2, completion: 1.2 },
  },
]

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      settings: {
        apiKey: "",
        defaultModel: "anthropic/claude-3-sonnet",
        temperature: 0.7,
        maxTokens: 4096,
        streamResponses: true,
      },
      availableModels: defaultModels,
      selectedModel: "anthropic/claude-3-sonnet",
      usageStats: {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        requestsByModel: {},
        tokensByModel: {},
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      setApiKey: (apiKey) => {
        set((state) => ({
          settings: { ...state.settings, apiKey },
        }))
      },

      setSelectedModel: (modelId) => {
        set({ selectedModel: modelId })
      },

      updateUsageStats: (tokens, cost, model) => {
        set((state) => ({
          usageStats: {
            totalRequests: state.usageStats.totalRequests + 1,
            totalTokens: state.usageStats.totalTokens + tokens,
            totalCost: state.usageStats.totalCost + cost,
            requestsByModel: {
              ...state.usageStats.requestsByModel,
              [model]: (state.usageStats.requestsByModel[model] || 0) + 1,
            },
            tokensByModel: {
              ...state.usageStats.tokensByModel,
              [model]: (state.usageStats.tokensByModel[model] || 0) + tokens,
            },
          },
        }))
      },

      resetUsageStats: () => {
        set({
          usageStats: {
            totalRequests: 0,
            totalTokens: 0,
            totalCost: 0,
            requestsByModel: {},
            tokensByModel: {},
          },
        })
      },

      isConfigured: () => {
        const { settings } = get()
        return settings.apiKey.length > 0
      },
    }),
    {
      name: "opencode-ai-storage",
      partialize: (state) => ({
        settings: {
          ...state.settings,
          apiKey: state.settings.apiKey,
        },
        selectedModel: state.selectedModel,
        usageStats: state.usageStats,
      }),
    },
  ),
)
