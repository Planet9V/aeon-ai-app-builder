import { describe, it, expect, beforeEach, vi } from "vitest"
import { BusinessAnalystAgent } from "../src/agents/BusinessAnalyst"
import { MethodDesignerAgent } from "../src/agents/MethodDesigner"
import { ArchitectAgent } from "../src/agents/Architect"
import { DeveloperAgent } from "../src/agents/Developer"
import { OpenRouterClient } from "@opencode/openrouter-sdk"

const mockClient = {
  chat: vi.fn(),
} as unknown as OpenRouterClient

describe("BMAD Agents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("BusinessAnalystAgent", () => {
    let agent: BusinessAnalystAgent

    beforeEach(() => {
      agent = new BusinessAnalystAgent(mockClient)
    })

    it("should have correct name and role", () => {
      expect(agent).toHaveProperty("name")
      expect(agent).toHaveProperty("role")
    })

    it("should return structured requirements output", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                requirements: ["Req 1", "Req 2"],
                userStories: [
                  {
                    title: "As a user, I want to login",
                    description: "User authentication",
                    acceptanceCriteria: ["Given...", "When...", "Then..."],
                  },
                ],
                stakeholders: ["Users", "Admins"],
                successCriteria: ["Metric 1", "Metric 2"],
              }),
            },
          },
        ],
        usage: { total_tokens: 500 },
        model: "anthropic/claude-3-sonnet",
      }

      ;(mockClient.chat as any).mockResolvedValue(mockResponse)

      const result = await agent.processInput("Create a login system")

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty("requirements")
      expect(result.data).toHaveProperty("userStories")
      expect(result.data).toHaveProperty("stakeholders")
      expect(result.data).toHaveProperty("successCriteria")
      expect(result.metadata?.tokensUsed).toBe(500)
    })

    it("should handle errors gracefully", async () => {
      ;(mockClient.chat as any).mockRejectedValue(new Error("API Error"))

      const result = await agent.processInput("test")

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe("MethodDesignerAgent", () => {
    let agent: MethodDesignerAgent

    beforeEach(() => {
      agent = new MethodDesignerAgent(mockClient)
    })

    it("should return technical approach output", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                approach: "Use React + Firebase",
                technologies: [
                  {
                    name: "React",
                    purpose: "Frontend",
                    rationale: "Component-based",
                  },
                ],
                designPatterns: ["Observer", "MVC"],
                implementationSteps: [
                  {
                    step: 1,
                    description: "Setup project",
                    estimatedHours: 4,
                  },
                ],
                risks: [
                  {
                    description: "API limits",
                    mitigation: "Caching",
                    severity: "medium",
                  },
                ],
              }),
            },
          },
        ],
        usage: { total_tokens: 600 },
        model: "anthropic/claude-3-sonnet",
      }

      ;(mockClient.chat as any).mockResolvedValue(mockResponse)

      const result = await agent.processInput("Create a todo app", {
        previousOutput: { requirements: [] },
      })

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty("approach")
      expect(result.data).toHaveProperty("technologies")
      expect(result.data).toHaveProperty("designPatterns")
      expect(result.data).toHaveProperty("implementationSteps")
      expect(result.data).toHaveProperty("risks")
    })
  })

  describe("ArchitectAgent", () => {
    let agent: ArchitectAgent

    beforeEach(() => {
      agent = new ArchitectAgent(mockClient)
    })

    it("should return architecture design output", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                components: [
                  {
                    name: "UserService",
                    responsibility: "User management",
                    interfaces: ["IAuth"],
                    dependencies: ["Database"],
                  },
                ],
                apiContracts: [
                  {
                    endpoint: "/api/users",
                    method: "GET",
                    request: {},
                    response: { users: [] },
                  },
                ],
                diagrams: {
                  system: "graph TD\\nA --> B",
                },
                architectureDecisions: [
                  {
                    decision: "Use REST",
                    rationale: "Simpler",
                    alternatives: ["GraphQL"],
                  },
                ],
              }),
            },
          },
        ],
        usage: { total_tokens: 700 },
        model: "anthropic/claude-3-sonnet",
      }

      ;(mockClient.chat as any).mockResolvedValue(mockResponse)

      const result = await agent.processInput("Design the system")

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty("components")
      expect(result.data).toHaveProperty("apiContracts")
      expect(result.data).toHaveProperty("diagrams")
      expect(result.data).toHaveProperty("architectureDecisions")
    })
  })

  describe("DeveloperAgent", () => {
    let agent: DeveloperAgent

    beforeEach(() => {
      agent = new DeveloperAgent(mockClient)
    })

    it("should return code implementation output", async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                files: [
                  {
                    path: "src/UserService.ts",
                    content: "class UserService {}",
                    language: "typescript",
                    purpose: "User management",
                  },
                ],
                tests: [
                  {
                    path: "tests/UserService.test.ts",
                    content: "describe('UserService', () => {})",
                    framework: "vitest",
                  },
                ],
                documentation: {
                  readme: "# User Service",
                  comments: ["Use TypeScript"],
                },
                nextSteps: ["Deploy", "Configure"],
              }),
            },
          },
        ],
        usage: { total_tokens: 800 },
        model: "anthropic/claude-3-sonnet",
      }

      ;(mockClient.chat as any).mockResolvedValue(mockResponse)

      const result = await agent.processInput("Implement UserService")

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty("files")
      expect(result.data).toHaveProperty("tests")
      expect(result.data).toHaveProperty("documentation")
      expect(result.data).toHaveProperty("nextSteps")
    })
  })
})
