/**
 * Advanced AI Workflow Orchestration Hook
 * Enables complex multi-agent workflows with dependency management
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { AIMessage, AIResponse, getDefaultClient } from "@opencode/openrouter-sdk"

export interface WorkflowStep {
  id: string
  name: string
  description: string
  agent: string
  prompt: string
  dependencies: string[]
  outputKey: string
  config?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
}

export interface WorkflowExecution {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  currentStep?: string
  results: Record<string, any>
  errors: Record<string, string>
  startTime: Date
  endTime?: Date
  progress: number
}

export interface WorkflowConfig {
  name: string
  description: string
  steps: WorkflowStep[]
  onStepComplete?: (stepId: string, result: any) => void
  onWorkflowComplete?: (results: Record<string, any>) => void
  onError?: (stepId: string, error: string) => void
}

export function useWorkflow() {
  const [executions, setExecutions] = useState<Record<string, WorkflowExecution>>({})
  const clientRef = useRef(getDefaultClient())

  /**
   * Execute a workflow with dependency resolution
   */
  const executeWorkflow = useCallback(async (config: WorkflowConfig): Promise<string> => {
    const executionId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const execution: WorkflowExecution = {
      id: executionId,
      status: "pending",
      results: {},
      errors: {},
      startTime: new Date(),
      progress: 0,
    }

    setExecutions((prev) => ({ ...prev, [executionId]: execution }))

    try {
      // Build dependency graph
      const stepMap = new Map(config.steps.map((step) => [step.id, step]))
      const completed = new Set<string>()
      const inProgress = new Set<string>()

      const executeStep = async (step: WorkflowStep): Promise<any> => {
        if (completed.has(step.id)) return execution.results[step.outputKey]

        setExecutions((prev) => ({
          ...prev,
          [executionId]: {
            ...prev[executionId],
            status: "running",
            currentStep: step.id,
          },
        }))

        inProgress.add(step.id)

        try {
          // Prepare prompt with dependencies
          let processedPrompt = step.prompt
          for (const [key, value] of Object.entries(execution.results)) {
            processedPrompt = processedPrompt.replace(new RegExp(`{{${key}}}`, "g"), String(value))
          }

          // Execute step
          const messages: AIMessage[] = [{ role: "user", content: processedPrompt }]
          const response = await clientRef.current.generate(messages, {
            model: step.config?.model || "openai/gpt-4o",
            temperature: step.config?.temperature || 0.7,
            max_tokens: step.config?.maxTokens || 2000,
          })

          const result = response.content

          // Store result
          setExecutions((prev) => ({
            ...prev,
            [executionId]: {
              ...prev[executionId],
              results: { ...prev[executionId].results, [step.outputKey]: result },
              progress: ((completed.size + 1) / config.steps.length) * 100,
            },
          }))

          completed.add(step.id)
          inProgress.delete(step.id)

          config.onStepComplete?.(step.id, result)
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          setExecutions((prev) => ({
            ...prev,
            [executionId]: {
              ...prev[executionId],
              status: "failed",
              errors: { ...prev[executionId].errors, [step.id]: errorMessage },
            },
          }))

          config.onError?.(step.id, errorMessage)
          throw error
        }
      }

      // Execute steps in dependency order
      const executed = new Set<string>()

      while (executed.size < config.steps.length) {
        const readySteps = config.steps.filter(
          (step) =>
            !executed.has(step.id) && !inProgress.has(step.id) && step.dependencies.every((dep) => completed.has(dep)),
        )

        if (readySteps.length === 0) {
          if (inProgress.size === 0) {
            throw new Error("Workflow deadlock: circular dependencies or missing steps")
          }
          // Wait for in-progress steps
          await new Promise((resolve) => setTimeout(resolve, 100))
          continue
        }

        // Execute ready steps in parallel
        await Promise.all(readySteps.map((step) => executeStep(step)))
        readySteps.forEach((step) => executed.add(step.id))
      }

      // Mark workflow as completed
      setExecutions((prev) => ({
        ...prev,
        [executionId]: {
          ...prev[executionId],
          status: "completed",
          endTime: new Date(),
          progress: 100,
        },
      }))

      config.onWorkflowComplete?.(execution.results)
    } catch (error) {
      setExecutions((prev) => ({
        ...prev,
        [executionId]: {
          ...prev[executionId],
          status: "failed",
          endTime: new Date(),
        },
      }))
    }

    return executionId
  }, [])

  /**
   * Get workflow execution status
   */
  const getExecution = useCallback(
    (executionId: string): WorkflowExecution | null => {
      return executions[executionId] || null
    },
    [executions],
  )

  /**
   * Cancel a running workflow
   */
  const cancelExecution = useCallback((executionId: string) => {
    setExecutions((prev) => ({
      ...prev,
      [executionId]: {
        ...prev[executionId],
        status: "failed",
        endTime: new Date(),
        errors: { ...prev[executionId].errors, cancelled: "Workflow cancelled by user" },
      },
    }))
  }, [])

  /**
   * Clear completed executions
   */
  const clearExecutions = useCallback((olderThanHours = 24) => {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    setExecutions((prev) => {
      const filtered: Record<string, WorkflowExecution> = {}
      Object.entries(prev).forEach(([id, execution]) => {
        if (execution.endTime && execution.endTime > cutoff) {
          filtered[id] = execution
        }
      })
      return filtered
    })
  }, [])

  return {
    executeWorkflow,
    getExecution,
    cancelExecution,
    clearExecutions,
    executions: Object.values(executions),
  }
}

/**
 * Pre-built workflow templates
 */
export const workflowTemplates = {
  codeReview: {
    name: "Code Review Workflow",
    description: "Comprehensive code review with multiple AI agents",
    steps: [
      {
        id: "analyze",
        name: "Code Analysis",
        description: "Analyze code structure and patterns",
        agent: "analyzer",
        prompt: "Analyze this code for structure, patterns, and potential issues:\n\n{{code}}",
        dependencies: [],
        outputKey: "analysis",
        config: { model: "openai/gpt-4o", temperature: 0.3 },
      },
      {
        id: "security",
        name: "Security Review",
        description: "Check for security vulnerabilities",
        agent: "security",
        prompt: "Review this code for security vulnerabilities:\n\n{{code}}\n\nAnalysis: {{analysis}}",
        dependencies: ["analyze"],
        outputKey: "security",
        config: { model: "anthropic/claude-3-haiku", temperature: 0.2 },
      },
      {
        id: "performance",
        name: "Performance Analysis",
        description: "Analyze performance implications",
        agent: "performance",
        prompt: "Analyze performance implications of this code:\n\n{{code}}\n\nAnalysis: {{analysis}}",
        dependencies: ["analyze"],
        outputKey: "performance",
        config: { model: "openai/gpt-4o-mini", temperature: 0.4 },
      },
      {
        id: "suggestions",
        name: "Improvement Suggestions",
        description: "Provide improvement recommendations",
        agent: "improver",
        prompt:
          "Based on the analysis, suggest improvements:\n\nCode: {{code}}\nAnalysis: {{analysis}}\nSecurity: {{security}}\nPerformance: {{performance}}",
        dependencies: ["analyze", "security", "performance"],
        outputKey: "suggestions",
        config: { model: "openai/gpt-4o", temperature: 0.6 },
      },
    ],
  },

  contentCreation: {
    name: "Content Creation Workflow",
    description: "Multi-step content creation and optimization",
    steps: [
      {
        id: "research",
        name: "Topic Research",
        description: "Research the topic thoroughly",
        agent: "researcher",
        prompt: "Research this topic comprehensively: {{topic}}",
        dependencies: [],
        outputKey: "research",
        config: { model: "openai/gpt-4o", temperature: 0.5 },
      },
      {
        id: "outline",
        name: "Content Outline",
        description: "Create detailed content outline",
        agent: "planner",
        prompt: "Create a detailed outline for content about: {{topic}}\n\nResearch: {{research}}",
        dependencies: ["research"],
        outputKey: "outline",
        config: { model: "anthropic/claude-3.5-sonnet", temperature: 0.4 },
      },
      {
        id: "write",
        name: "Content Writing",
        description: "Write the main content",
        agent: "writer",
        prompt: "Write comprehensive content about: {{topic}}\n\nResearch: {{research}}\nOutline: {{outline}}",
        dependencies: ["research", "outline"],
        outputKey: "content",
        config: { model: "openai/gpt-4o", temperature: 0.7 },
      },
      {
        id: "edit",
        name: "Content Editing",
        description: "Edit and polish the content",
        agent: "editor",
        prompt: "Edit and improve this content:\n\n{{content}}\n\nMake it more engaging and professional.",
        dependencies: ["write"],
        outputKey: "edited",
        config: { model: "anthropic/claude-3-haiku", temperature: 0.3 },
      },
    ],
  },
}
