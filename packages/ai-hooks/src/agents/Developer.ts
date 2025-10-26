import { BaseAgent, type AgentContext, type AgentOutput } from "./BaseAgent"
import { OpenRouterClient } from "@opencode/openrouter-sdk"

export interface CodeOutput {
  files: Array<{
    path: string
    content: string
    language: string
    purpose: string
  }>
  tests: Array<{
    path: string
    content: string
    framework: string
  }>
  documentation: {
    readme: string
    apiDocs?: string
    comments: string[]
  }
  nextSteps: string[]
}

export class DeveloperAgent extends BaseAgent {
  constructor(private client: OpenRouterClient) {
    super("Developer", "Code Implementation")
  }

  getSystemPrompt(): string {
    return `You are a Senior Software Developer.

Your role is to:
1. Generate production-quality implementation code
2. Follow language-specific best practices
3. Include comprehensive error handling
4. Add clear inline documentation
5. Suggest unit and integration tests

Output Format:
Return a JSON object with this structure:
{
  "files": [
    {
      "path": "src/services/UserService.ts",
      "content": "// Full file content here",
      "language": "typescript",
      "purpose": "User authentication service"
    }
  ],
  "tests": [
    {
      "path": "tests/UserService.test.ts",
      "content": "// Test code here",
      "framework": "vitest"
    }
  ],
  "documentation": {
    "readme": "# Setup instructions...",
    "apiDocs": "Optional API documentation",
    "comments": ["Key implementation notes"]
  },
  "nextSteps": [
    "Deploy to staging",
    "Configure environment variables"
  ]
}

Code Quality Requirements:
- TypeScript with strict typing (avoid 'any')
- Prefer const over let
- Include JSDoc comments for public APIs
- Handle edge cases and errors
- Follow SOLID principles
- Keep functions focused and testable`
  }

  async processInput(input: string, context?: AgentContext): Promise<AgentOutput> {
    const startTime = Date.now()

    try {
      let fullContext = input

      if (context?.previousOutput) {
        fullContext += `\n\nArchitecture from Architect:\n${JSON.stringify(context.previousOutput, null, 2)}`
      }

      if (context?.files?.length) {
        fullContext += `\n\nExisting Files:\n${context.files.join(", ")}`
      }

      const messages = this.buildMessages(fullContext)

      const response = await this.client.chat({
        messages,
        temperature: 0.3,
        max_tokens: 4000,
      })

      const content = response.choices[0]?.message?.content || ""
      const data = this.parseJSONOutput(content) as CodeOutput

      return {
        success: true,
        data,
        metadata: {
          tokensUsed: response.usage?.total_tokens || 0,
          model: response.model || "",
          duration: Date.now() - startTime,
        },
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          tokensUsed: 0,
          model: "",
          duration: Date.now() - startTime,
        },
      }
    }
  }
}
