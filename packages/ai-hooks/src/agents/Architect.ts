import { BaseAgent, type AgentContext, type AgentOutput } from "./BaseAgent"
import { OpenRouterClient } from "@opencode/openrouter-sdk"

export interface ArchitectureOutput {
  components: Array<{
    name: string
    responsibility: string
    interfaces: string[]
    dependencies: string[]
  }>
  apiContracts: Array<{
    endpoint: string
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    request: any
    response: any
  }>
  databaseSchema?: {
    tables: Array<{
      name: string
      columns: Array<{
        name: string
        type: string
        constraints: string[]
      }>
      relationships: string[]
    }>
  }
  diagrams: {
    system?: string
    component?: string
    sequence?: string
  }
  architectureDecisions: Array<{
    decision: string
    rationale: string
    alternatives: string[]
  }>
}

export class ArchitectAgent extends BaseAgent {
  constructor(private client: OpenRouterClient) {
    super("Architect", "System Architecture")
  }

  getSystemPrompt(): string {
    return `You are a Software Architect.

Your role is to:
1. Design detailed component structure
2. Define API contracts (REST/GraphQL)
3. Design database schema (if applicable)
4. Create system diagrams using Mermaid syntax
5. Document architecture decisions with rationale

Output Format:
Return a JSON object with this structure:
{
  "components": [
    {
      "name": "UserService",
      "responsibility": "Handle user authentication",
      "interfaces": ["IAuthProvider"],
      "dependencies": ["Database", "EmailService"]
    }
  ],
  "apiContracts": [
    {
      "endpoint": "/api/users",
      "method": "GET",
      "request": {},
      "response": {"users": []}
    }
  ],
  "databaseSchema": {
    "tables": [...]
  },
  "diagrams": {
    "system": "graph TD\\nA[Client] --> B[API]",
    "component": "...",
    "sequence": "..."
  },
  "architectureDecisions": [
    {
      "decision": "Use REST over GraphQL",
      "rationale": "Simpler for this use case",
      "alternatives": ["GraphQL", "gRPC"]
    }
  ]
}

Use Mermaid syntax for diagrams. Focus on clarity and scalability.`
  }

  async processInput(input: string, context?: AgentContext): Promise<AgentOutput> {
    const startTime = Date.now()

    try {
      const contextInfo = context?.previousOutput
        ? `\n\nTechnical Approach from Method Designer:\n${JSON.stringify(context.previousOutput, null, 2)}`
        : ""

      const messages = this.buildMessages(input + contextInfo)

      const response = await this.client.chat({
        messages,
        temperature: 0.5,
        max_tokens: 3000,
      })

      const content = response.choices[0]?.message?.content || ""
      const data = this.parseJSONOutput(content) as ArchitectureOutput

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
