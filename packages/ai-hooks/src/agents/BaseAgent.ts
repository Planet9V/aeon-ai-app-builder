import type { Message } from "@opencode/openrouter-sdk"

export interface AgentContext {
  files?: string[]
  selection?: string
  projectStructure?: any
  previousOutput?: any
}

export interface AgentOutput {
  success: boolean
  data: any
  error?: string
  metadata?: {
    tokensUsed: number
    model: string
    duration: number
  }
}

export abstract class BaseAgent {
  constructor(protected name: string, protected role: string) {}

  abstract getSystemPrompt(): string
  abstract processInput(input: string, context?: AgentContext): Promise<AgentOutput>

  protected buildMessages(userInput: string, systemPrompt?: string): Message[] {
    const messages: Message[] = []

    if (systemPrompt || this.getSystemPrompt()) {
      messages.push({
        role: "system",
        content: systemPrompt || this.getSystemPrompt(),
      })
    }

    messages.push({
      role: "user",
      content: userInput,
    })

    return messages
  }

  protected parseJSONOutput(response: string): any {
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }
      return JSON.parse(response)
    } catch (error) {
      return {
        raw: response,
        parsed: false,
      }
    }
  }
}
