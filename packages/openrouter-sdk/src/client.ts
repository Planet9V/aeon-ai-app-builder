import type {
  OpenRouterConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  Message,
  UsageStats,
} from "./types"
import { OpenRouterError, ChatCompletionResponseSchema, ChatCompletionChunkSchema } from "./types"
import { DEFAULT_MODEL, calculateCost } from "./models"

export class OpenRouterClient {
  private config: Required<OpenRouterConfig>
  private stats: UsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    byModel: {},
  }

  constructor(config: OpenRouterConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseURL: config.baseURL || "https://openrouter.ai/api/v1",
      defaultModel: config.defaultModel || DEFAULT_MODEL,
      siteUrl: config.siteUrl || "https://opencode.dev",
      siteName: config.siteName || "OpenCode Platform",
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 60000,
    }

    if (!this.config.apiKey) {
      throw new OpenRouterError("API key is required")
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      "HTTP-Referer": this.config.siteUrl,
      "X-Title": this.config.siteName,
    }
  }

  private async request<T>(path: string, options: RequestInit, retries: number = this.config.maxRetries): Promise<T> {
    const url = `${this.config.baseURL}${path}`

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new OpenRouterError(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          error.error?.code,
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof OpenRouterError) {
        // Retry on rate limit or server errors
        if (retries > 0 && error.status && [429, 500, 502, 503].includes(error.status)) {
          const delay = Math.pow(2, this.config.maxRetries - retries) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
          return this.request<T>(path, options, retries - 1)
        }
        throw error
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenRouterError("Request timeout")
      }

      throw new OpenRouterError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  async chat(request: Partial<ChatCompletionRequest>): Promise<ChatCompletionResponse> {
    const model = request.model || this.config.defaultModel
    const messages = request.messages || []

    if (messages.length === 0) {
      throw new OpenRouterError("Messages array cannot be empty")
    }

    const body = {
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      frequency_penalty: request.frequencyPenalty,
      presence_penalty: request.presencePenalty,
      stream: false,
    }

    const response = await this.request<ChatCompletionResponse>("/chat/completions", {
      method: "POST",
      body: JSON.stringify(body),
    })

    // Validate response
    const validated = ChatCompletionResponseSchema.parse(response)

    // Update stats
    this.updateStats(model, validated.usage)

    return validated
  }

  async *streamChat(request: Partial<ChatCompletionRequest>): AsyncGenerator<string, void, undefined> {
    const model = request.model || this.config.defaultModel
    const messages = request.messages || []

    if (messages.length === 0) {
      throw new OpenRouterError("Messages array cannot be empty")
    }

    const body = {
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      top_p: request.topP,
      frequency_penalty: request.frequencyPenalty,
      presence_penalty: request.presencePenalty,
      stream: true,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new OpenRouterError(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          error.error?.code,
        )
      }

      if (!response.body) {
        throw new OpenRouterError("Response body is null")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      this.stats.totalRequests++

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith("data: ")) continue

          const data = trimmed.slice(6) // Remove 'data: ' prefix
          if (data === "[DONE]") continue

          try {
            const chunk = JSON.parse(data)
            const validated = ChatCompletionChunkSchema.parse(chunk)

            const content = validated.choices[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (error) {
            console.error("Failed to parse chunk:", error)
          }
        }
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getModels(): Promise<any[]> {
    return this.request<any[]>("/models", {
      method: "GET",
    })
  }

  private updateStats(
    model: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
  ): void {
    this.stats.totalRequests++
    this.stats.totalTokens += usage.totalTokens

    const cost = calculateCost(model, usage.promptTokens, usage.completionTokens)
    this.stats.totalCost += cost

    if (!this.stats.byModel[model]) {
      this.stats.byModel[model] = {
        requests: 0,
        tokens: 0,
        cost: 0,
      }
    }

    this.stats.byModel[model].requests++
    this.stats.byModel[model].tokens += usage.totalTokens
    this.stats.byModel[model].cost += cost
  }

  getStats(): UsageStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byModel: {},
    }
  }
}

// Convenience function
export function createClient(apiKey: string, config?: Partial<OpenRouterConfig>): OpenRouterClient {
  return new OpenRouterClient({
    apiKey,
    ...config,
  })
}
