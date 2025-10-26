/**
 * AI Configuration for OpenCode Platform
 * Manages OpenRouter API settings and defaults
 */

export const AI_CONFIG = {
  // Default model (can be overridden by user preference)
  defaultModel: "anthropic/claude-3-sonnet",

  // API settings
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
  siteUrl: "https://opencode.dev",
  siteName: "OpenCode Platform",

  // Request settings
  maxRetries: 3,
  timeout: 60000, // 60 seconds
  temperature: 0.7,
  maxTokens: 4096,

  // Budget limits (USD)
  dailyBudget: 10.0,
  warningThreshold: 0.8, // 80%

  // Feature flags
  features: {
    chat: true,
    suggestions: true,
    bmadWorkflow: true,
    analytics: true,
  },
}

export function validateApiKey(key: string): boolean {
  return key.startsWith("sk-or-v1-") && key.length > 20
}

export function getApiKey(): string {
  const key = AI_CONFIG.apiKey

  if (!key) {
    throw new Error("VITE_OPENROUTER_API_KEY environment variable is not set")
  }

  if (!validateApiKey(key)) {
    throw new Error("Invalid OpenRouter API key format")
  }

  return key
}
