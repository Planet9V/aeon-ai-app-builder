import { describe, it, expect, beforeEach, vi } from "vitest"
import { OpenRouterClient } from "../src/client"
import { OpenRouterError } from "../src/types"

describe("OpenRouterClient", () => {
  let client: OpenRouterClient
  const mockApiKey = "sk-or-test-key"

  beforeEach(() => {
    client = new OpenRouterClient({
      apiKey: mockApiKey,
      baseURL: "https://openrouter.ai/api/v1",
    })
    vi.clearAllMocks()
  })

  describe("Constructor", () => {
    it("should create client with valid API key", () => {
      expect(client).toBeInstanceOf(OpenRouterClient)
    })

    it("should throw error without API key", () => {
      expect(() => new OpenRouterClient({ apiKey: "" })).toThrow(OpenRouterError)
    })

    it("should use default base URL if not provided", () => {
      const defaultClient = new OpenRouterClient({ apiKey: mockApiKey })
      expect(defaultClient).toBeInstanceOf(OpenRouterClient)
    })
  })

  describe("chat", () => {
    it("should send chat completion request", async () => {
      const mockResponse = {
        id: "gen-123",
        model: "anthropic/claude-3-sonnet",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Hello! How can I help you?",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 8,
          total_tokens: 18,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await client.chat({
        messages: [{ role: "user", content: "Hello" }],
      })

      expect(response.choices[0].message.content).toBe("Hello! How can I help you?")
      expect(response.usage?.total_tokens).toBe(18)
    })

    it("should throw error on empty messages array", async () => {
      await expect(client.chat({ messages: [] })).rejects.toThrow(OpenRouterError)
    })

    it("should handle API errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          error: { message: "Invalid API key" },
        }),
      })

      await expect(client.chat({ messages: [{ role: "user", content: "test" }] })).rejects.toThrow(OpenRouterError)
    })

    it("should retry on rate limit error", async () => {
      let attempts = 0
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: "Too Many Requests",
            json: async () => ({ error: { message: "Rate limit exceeded" } }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "gen-123",
            choices: [{ message: { role: "assistant", content: "Success" } }],
            usage: { total_tokens: 10 },
          }),
        })
      })

      const response = await client.chat({
        messages: [{ role: "user", content: "test" }],
      })

      expect(attempts).toBe(2)
      expect(response.choices[0].message.content).toBe("Success")
    })
  })

  describe("streamChat", () => {
    it("should stream chat completion", async () => {
      const mockChunks = [
        { choices: [{ delta: { content: "Hello" } }] },
        { choices: [{ delta: { content: " there" } }] },
        { choices: [{ delta: { content: "!" } }] },
      ]

      const mockStream = {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(JSON.stringify(mockChunks[0])) })
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(JSON.stringify(mockChunks[1])) })
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(JSON.stringify(mockChunks[2])) })
            .mockResolvedValueOnce({ done: true }),
        }),
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockStream,
      })

      const chunks: string[] = []
      for await (const chunk of client.streamChat({
        messages: [{ role: "user", content: "Hello" }],
      })) {
        chunks.push(chunk.content)
      }

      expect(chunks).toEqual(["Hello", " there", "!"])
    })
  })

  describe("getStats", () => {
    it("should return usage statistics", () => {
      const stats = client.getStats()

      expect(stats).toHaveProperty("totalRequests")
      expect(stats).toHaveProperty("totalTokens")
      expect(stats).toHaveProperty("totalCost")
      expect(stats).toHaveProperty("byModel")
    })

    it("should track requests after chat calls", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "gen-123",
          model: "anthropic/claude-3-sonnet",
          choices: [{ message: { role: "assistant", content: "test" } }],
          usage: { total_tokens: 100 },
        }),
      })

      await client.chat({ messages: [{ role: "user", content: "test" }] })

      const stats = client.getStats()
      expect(stats.totalRequests).toBeGreaterThan(0)
      expect(stats.totalTokens).toBeGreaterThan(0)
    })
  })
})
