import { describe, it, expect, beforeEach, vi } from "vitest"
import { BMADWorkflow } from "../src/workflow/BMADWorkflow"
import { OpenRouterClient } from "@opencode/openrouter-sdk"

const mockClient = {
  chat: vi.fn(),
} as unknown as OpenRouterClient

describe("BMADWorkflow", () => {
  let workflow: BMADWorkflow

  beforeEach(() => {
    workflow = new BMADWorkflow(mockClient)
    vi.clearAllMocks()
  })

  describe("Workflow Execution", () => {
    it("should execute all 4 agents in sequence", async () => {
      const mockResponses = [
        {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  requirements: ["Req 1"],
                  userStories: [],
                  stakeholders: [],
                  successCriteria: [],
                }),
              },
            },
          ],
          usage: { total_tokens: 100 },
          model: "anthropic/claude-3-sonnet",
        },
        {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  approach: "React approach",
                  technologies: [],
                  designPatterns: [],
                  implementationSteps: [],
                  risks: [],
                }),
              },
            },
          ],
          usage: { total_tokens: 200 },
          model: "anthropic/claude-3-sonnet",
        },
        {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  components: [],
                  apiContracts: [],
                  diagrams: {},
                  architectureDecisions: [],
                }),
              },
            },
          ],
          usage: { total_tokens: 300 },
          model: "anthropic/claude-3-sonnet",
        },
        {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  files: [],
                  tests: [],
                  documentation: { readme: "" },
                  nextSteps: [],
                }),
              },
            },
          ],
          usage: { total_tokens: 400 },
          model: "anthropic/claude-3-sonnet",
        },
      ]

      ;(mockClient.chat as any)
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2])
        .mockResolvedValueOnce(mockResponses[3])

      const result = await workflow.run("Create a todo app")

      expect(result.success).toBe(true)
      expect(result.state.phase).toBe("complete")
      expect(result.state.requirements).toBeDefined()
      expect(result.state.approach).toBeDefined()
      expect(result.state.architecture).toBeDefined()
      expect(result.state.code).toBeDefined()
      expect(result.totalTokens).toBe(1000)
      expect(mockClient.chat).toHaveBeenCalledTimes(4)
    })

    it("should track progress through workflow", async () => {
      const mockResponse = {
        choices: [{ message: { content: JSON.stringify({}) } }],
        usage: { total_tokens: 100 },
        model: "test",
      }
      ;(mockClient.chat as any).mockResolvedValue(mockResponse)

      const progressStates: number[] = []

      const promise = workflow.run("test")

      await new Promise((resolve) => setTimeout(resolve, 100))
      progressStates.push(workflow.getState().progress)

      await new Promise((resolve) => setTimeout(resolve, 100))
      progressStates.push(workflow.getState().progress)

      await promise

      expect(progressStates.some((p) => p > 0 && p < 100)).toBe(true)
      expect(workflow.getState().progress).toBe(100)
    })

    it("should handle agent failures", async () => {
      ;(mockClient.chat as any).mockRejectedValue(new Error("Agent failed"))

      const result = await workflow.run("test")

      expect(result.success).toBe(false)
      expect(result.state.error).toBeDefined()
      expect(result.state.isRunning).toBe(false)
    })

    it("should pass context between agents", async () => {
      const businessOutput = { requirements: ["Req 1"] }

      ;(mockClient.chat as any)
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(businessOutput) } }],
          usage: { total_tokens: 100 },
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify({ approach: "test" }) } }],
          usage: { total_tokens: 100 },
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify({ components: [] }) } }],
          usage: { total_tokens: 100 },
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify({ files: [] }) } }],
          usage: { total_tokens: 100 },
        })

      await workflow.run("test")

      const calls = (mockClient.chat as any).mock.calls
      expect(calls.length).toBeGreaterThan(1)
    })
  })

  describe("State Management", () => {
    it("should initialize with pending state", () => {
      const state = workflow.getState()

      expect(state.phase).toBe("requirements")
      expect(state.isRunning).toBe(false)
      expect(state.progress).toBe(0)
    })

    it("should reset workflow state", () => {
      workflow.reset()

      const state = workflow.getState()
      expect(state.phase).toBe("requirements")
      expect(state.isRunning).toBe(false)
      expect(state.progress).toBe(0)
      expect(state.requirements).toBeUndefined()
    })
  })

  describe("Cost Estimation", () => {
    it("should estimate cost based on tokens", async () => {
      ;(mockClient.chat as any).mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({}) } }],
        usage: { total_tokens: 1000000 },
        model: "test",
      })

      const result = await workflow.run("test")

      expect(result.totalCost).toBeGreaterThan(0)
    })
  })
})
