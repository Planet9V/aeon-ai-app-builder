import { OpenRouterClient } from "@opencode/openrouter-sdk"
import { BusinessAnalystAgent, type RequirementsOutput } from "../agents/BusinessAnalyst"
import { MethodDesignerAgent, type TechnicalApproachOutput } from "../agents/MethodDesigner"
import { ArchitectAgent, type ArchitectureOutput } from "../agents/Architect"
import { DeveloperAgent, type CodeOutput } from "../agents/Developer"
import type { AgentContext } from "../agents/BaseAgent"

export type WorkflowPhase = "requirements" | "approach" | "architecture" | "implementation" | "complete"

export interface BMADWorkflowState {
  phase: WorkflowPhase
  requirements?: RequirementsOutput
  approach?: TechnicalApproachOutput
  architecture?: ArchitectureOutput
  code?: CodeOutput
  error?: string
  isRunning: boolean
  progress: number
}

export interface BMADWorkflowResult {
  success: boolean
  state: BMADWorkflowState
  totalTokens: number
  totalDuration: number
  totalCost: number
}

export class BMADWorkflow {
  private businessAnalyst: BusinessAnalystAgent
  private methodDesigner: MethodDesignerAgent
  private architect: ArchitectAgent
  private developer: DeveloperAgent

  private state: BMADWorkflowState = {
    phase: "requirements",
    isRunning: false,
    progress: 0,
  }

  constructor(client: OpenRouterClient) {
    this.businessAnalyst = new BusinessAnalystAgent(client)
    this.methodDesigner = new MethodDesignerAgent(client)
    this.architect = new ArchitectAgent(client)
    this.developer = new DeveloperAgent(client)
  }

  async run(userRequest: string, context?: AgentContext): Promise<BMADWorkflowResult> {
    this.state.isRunning = true
    this.state.progress = 0

    let totalTokens = 0
    let totalDuration = 0
    const startTime = Date.now()

    try {
      this.state.phase = "requirements"
      this.state.progress = 25
      const requirementsResult = await this.businessAnalyst.processInput(userRequest, context)

      if (!requirementsResult.success) {
        throw new Error(`Business Analyst failed: ${requirementsResult.error}`)
      }

      this.state.requirements = requirementsResult.data
      totalTokens += requirementsResult.metadata?.tokensUsed || 0

      this.state.phase = "approach"
      this.state.progress = 50
      const approachResult = await this.methodDesigner.processInput(userRequest, {
        ...context,
        previousOutput: requirementsResult.data,
      })

      if (!approachResult.success) {
        throw new Error(`Method Designer failed: ${approachResult.error}`)
      }

      this.state.approach = approachResult.data
      totalTokens += approachResult.metadata?.tokensUsed || 0

      this.state.phase = "architecture"
      this.state.progress = 75
      const architectureResult = await this.architect.processInput(userRequest, {
        ...context,
        previousOutput: approachResult.data,
      })

      if (!architectureResult.success) {
        throw new Error(`Architect failed: ${architectureResult.error}`)
      }

      this.state.architecture = architectureResult.data
      totalTokens += architectureResult.metadata?.tokensUsed || 0

      this.state.phase = "implementation"
      this.state.progress = 90
      const codeResult = await this.developer.processInput(userRequest, {
        ...context,
        previousOutput: architectureResult.data,
      })

      if (!codeResult.success) {
        throw new Error(`Developer failed: ${codeResult.error}`)
      }

      this.state.code = codeResult.data
      totalTokens += codeResult.metadata?.tokensUsed || 0

      this.state.phase = "complete"
      this.state.progress = 100
      this.state.isRunning = false

      totalDuration = Date.now() - startTime

      return {
        success: true,
        state: this.state,
        totalTokens,
        totalDuration,
        totalCost: this.estimateCost(totalTokens),
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : "Unknown error"
      this.state.isRunning = false

      totalDuration = Date.now() - startTime

      return {
        success: false,
        state: this.state,
        totalTokens,
        totalDuration,
        totalCost: this.estimateCost(totalTokens),
      }
    }
  }

  getState(): BMADWorkflowState {
    return this.state
  }

  reset() {
    this.state = {
      phase: "requirements",
      isRunning: false,
      progress: 0,
    }
  }

  private estimateCost(tokens: number): number {
    const costPerMillion = 3.0
    return (tokens / 1_000_000) * costPerMillion
  }
}
