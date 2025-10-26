import { useState, useCallback, useRef } from "react"
import { OpenRouterClient } from "@opencode/openrouter-sdk"
import { BMADWorkflow, type BMADWorkflowState, type BMADWorkflowResult } from "./workflow/BMADWorkflow"
import type { AgentContext } from "./agents/BaseAgent"

export interface UseBMADWorkflowOptions {
  apiKey: string
  model?: string
  onProgress?: (state: BMADWorkflowState) => void
}

export interface UseBMADWorkflowReturn {
  state: BMADWorkflowState
  result: BMADWorkflowResult | null
  run: (request: string, context?: AgentContext) => Promise<void>
  reset: () => void
  isRunning: boolean
}

export function useBMADWorkflow(options: UseBMADWorkflowOptions): UseBMADWorkflowReturn {
  const [state, setState] = useState<BMADWorkflowState>({
    phase: "requirements",
    isRunning: false,
    progress: 0,
  })
  const [result, setResult] = useState<BMADWorkflowResult | null>(null)

  const workflowRef = useRef<BMADWorkflow | null>(null)

  if (!workflowRef.current) {
    const client = new OpenRouterClient({
      apiKey: options.apiKey,
      defaultModel: options.model,
    })
    workflowRef.current = new BMADWorkflow(client)
  }

  const run = useCallback(
    async (request: string, context?: AgentContext) => {
      if (!workflowRef.current) return

      setState((prev) => ({ ...prev, isRunning: true, progress: 0 }))

      const pollInterval = setInterval(() => {
        if (workflowRef.current) {
          const currentState = workflowRef.current.getState()
          setState(currentState)
          options.onProgress?.(currentState)
        }
      }, 500)

      try {
        const workflowResult = await workflowRef.current.run(request, context)
        setResult(workflowResult)
        setState(workflowResult.state)
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isRunning: false,
        }))
      } finally {
        clearInterval(pollInterval)
      }
    },
    [options],
  )

  const reset = useCallback(() => {
    workflowRef.current?.reset()
    setState({
      phase: "requirements",
      isRunning: false,
      progress: 0,
    })
    setResult(null)
  }, [])

  return {
    state,
    result,
    run,
    reset,
    isRunning: state.isRunning,
  }
}
