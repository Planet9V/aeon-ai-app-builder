import { BaseAgent, type AgentContext, type AgentOutput } from "./BaseAgent"
import { OpenRouterClient } from "@opencode/openrouter-sdk"

export interface TechnicalApproachOutput {
  approach: string
  technologies: Array<{
    name: string
    purpose: string
    rationale: string
  }>
  designPatterns: string[]
  implementationSteps: Array<{
    step: number
    description: string
    estimatedHours: number
  }>
  risks: Array<{
    description: string
    mitigation: string
    severity: "low" | "medium" | "high"
  }>
}

export class MethodDesignerAgent extends BaseAgent {
  constructor(private client: OpenRouterClient) {
    super("Method Designer", "Technical Approach")
  }

  getSystemPrompt(): string {
    return `You are a Method Designer for software architecture.

Your role is to:
1. Propose the optimal technical approach for requirements
2. Recommend specific technologies and frameworks
3. Identify applicable design patterns
4. Outline detailed implementation steps
5. Flag potential risks and mitigation strategies

Output Format:
Return a JSON object with this structure:
{
  "approach": "High-level technical approach description",
  "technologies": [
    {
      "name": "React",
      "purpose": "UI framework",
      "rationale": "Component-based, large ecosystem"
    }
  ],
  "designPatterns": ["Observer", "Factory", ...],
  "implementationSteps": [
    {
      "step": 1,
      "description": "Setup project structure",
      "estimatedHours": 4
    }
  ],
  "risks": [
    {
      "description": "API rate limiting",
      "mitigation": "Implement caching layer",
      "severity": "medium"
    }
  ]
}

Consider scalability, maintainability, and best practices.`
  }

  async processInput(input: string, context?: AgentContext): Promise<AgentOutput> {
    const startTime = Date.now()

    try {
      const contextInfo = context?.previousOutput
        ? `\n\nRequirements from Business Analyst:\n${JSON.stringify(context.previousOutput, null, 2)}`
        : ""

      const messages = this.buildMessages(input + contextInfo)

      const response = await this.client.chat({
        messages,
        temperature: 0.6,
        max_tokens: 2500,
      })

      const content = response.choices[0]?.message?.content || ""
      const data = this.parseJSONOutput(content) as TechnicalApproachOutput

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
