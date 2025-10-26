import { BaseAgent, type AgentContext, type AgentOutput } from "./BaseAgent"
import { OpenRouterClient } from "@opencode/openrouter-sdk"

export interface RequirementsOutput {
  requirements: string[]
  userStories: Array<{
    title: string
    description: string
    acceptanceCriteria: string[]
  }>
  stakeholders: string[]
  successCriteria: string[]
}

export class BusinessAnalystAgent extends BaseAgent {
  constructor(private client: OpenRouterClient) {
    super("Business Analyst", "Requirements Gathering")
  }

  getSystemPrompt(): string {
    return `You are a Business Analyst for software development.

Your role is to:
1. Extract core requirements from user requests
2. Identify stakeholders and their needs
3. Define measurable success criteria
4. Create detailed user stories in Gherkin format
5. List acceptance criteria for each story

Output Format:
Return a JSON object with this structure:
{
  "requirements": ["req1", "req2", ...],
  "userStories": [
    {
      "title": "As a [role], I want [feature] so that [benefit]",
      "description": "Detailed description",
      "acceptanceCriteria": ["Given...", "When...", "Then..."]
    }
  ],
  "stakeholders": ["stakeholder1", "stakeholder2"],
  "successCriteria": ["metric1", "metric2"]
}

Be specific, measurable, and focused on business value.`
  }

  async processInput(input: string, context?: AgentContext): Promise<AgentOutput> {
    const startTime = Date.now()

    try {
      const messages = this.buildMessages(input)

      const response = await this.client.chat({
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      })

      const content = response.choices[0]?.message?.content || ""
      const data = this.parseJSONOutput(content) as RequirementsOutput

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
