/**
 * Universal AI React Hooks for Opencode Framework
 * Provides seamless AI integration in any React application
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { OpenRouterClient, AIMessage, AIResponse, getDefaultClient } from "@opencode/openrouter-sdk"

export interface UseAIConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  autoInitialize?: boolean
}

export interface UseAIState {
  isLoading: boolean
  error: string | null
  response: AIResponse | null
  history: AIMessage[]
}

/**
 * Core AI hook for single completions
 */
export function useAI(config: UseAIConfig = {}) {
  const [state, setState] = useState<UseAIState>({
    isLoading: false,
    error: null,
    response: null,
    history: [],
  })

  const clientRef = useRef<OpenRouterClient | null>(null)

  useEffect(() => {
    if (config.autoInitialize !== false) {
      try {
        clientRef.current = getDefaultClient()
      } catch (error) {
        setState((prev) => ({ ...prev, error: "AI client not initialized" }))
      }
    }
  }, [config.autoInitialize])

  const generate = useCallback(
    async (prompt: string, systemMessage?: string, options?: Partial<UseAIConfig>): Promise<AIResponse | null> => {
      if (!clientRef.current) {
        setState((prev) => ({ ...prev, error: "AI client not available" }))
        return null
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const messages: AIMessage[] = []

        if (systemMessage) {
          messages.push({ role: "system", content: systemMessage })
        }

        // Add conversation history
        messages.push(...state.history)

        // Add current prompt
        messages.push({ role: "user", content: prompt })

        const response = await clientRef.current.generate(messages, {
          model: options?.model || config.model,
          temperature: options?.temperature || config.temperature,
          max_tokens: options?.maxTokens || config.maxTokens,
        })

        setState((prev) => ({
          ...prev,
          isLoading: false,
          response,
          history: [...messages, { role: "assistant", content: response.content }],
        }))

        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))
        return null
      }
    },
    [state.history, config],
  )

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, history: [] }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    generate,
    clearHistory,
    clearError,
  }
}

/**
 * Chat hook for conversational AI interactions
 */
export function useChat(config: UseAIConfig = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState(config.model || "openai/gpt-4o-mini")

  const clientRef = useRef<OpenRouterClient | null>(null)

  useEffect(() => {
    try {
      clientRef.current = getDefaultClient()
    } catch (error) {
      setError("AI client not initialized")
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string, systemMessage?: string): Promise<AIResponse | null> => {
      if (!clientRef.current) {
        setError("AI client not available")
        return null
      }

      setIsLoading(true)
      setError(null)

      // Add user message
      const userMessage: AIMessage = { role: "user", content }
      const updatedMessages = [...messages, userMessage]

      if (systemMessage) {
        updatedMessages.unshift({ role: "system", content: systemMessage })
      }

      setMessages(updatedMessages)

      try {
        const response = await clientRef.current.generate(updatedMessages, {
          model: selectedModel,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        })

        // Add AI response
        const aiMessage: AIMessage = { role: "assistant", content: response.content }
        setMessages((prev) => [...prev, aiMessage])

        setIsLoading(false)
        return response
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setError(errorMessage)
        setIsLoading(false)
        return null
      }
    },
    [messages, selectedModel, config],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const changeModel = useCallback((model: string) => {
    setSelectedModel(model)
  }, [])

  return {
    messages,
    isLoading,
    error,
    selectedModel,
    sendMessage,
    clearChat,
    changeModel,
  }
}

/**
 * Streaming chat hook for real-time AI responses
 */
export function useStreamingChat(config: UseAIConfig = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState(config.model || "openai/gpt-4o-mini")
  const [currentStreamedContent, setCurrentStreamedContent] = useState("")

  const clientRef = useRef<OpenRouterClient | null>(null)

  useEffect(() => {
    try {
      clientRef.current = getDefaultClient()
    } catch (error) {
      setError("AI client not initialized")
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string, systemMessage?: string, onChunk?: (chunk: string) => void): Promise<AIResponse | null> => {
      if (!clientRef.current) {
        setError("AI client not available")
        return null
      }

      setIsLoading(true)
      setError(null)
      setCurrentStreamedContent("")

      // Add user message
      const userMessage: AIMessage = { role: "user", content }
      const updatedMessages = [...messages, userMessage]

      if (systemMessage) {
        updatedMessages.unshift({ role: "system", content: systemMessage })
      }

      setMessages(updatedMessages)

      try {
        let fullContent = ""
        const generator = clientRef.current.generateStream(updatedMessages, {
          model: selectedModel,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        })

        for await (const chunk of generator) {
          fullContent += chunk.content
          setCurrentStreamedContent(fullContent)
          onChunk?.(chunk.content)
        }

        // Add completed AI response
        const aiMessage: AIMessage = { role: "assistant", content: fullContent }
        setMessages((prev) => [...prev, aiMessage])
        setCurrentStreamedContent("")

        setIsLoading(false)
        return {
          content: fullContent,
          model: selectedModel,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setError(errorMessage)
        setIsLoading(false)
        return null
      }
    },
    [messages, selectedModel, config],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    setCurrentStreamedContent("")
  }, [])

  const changeModel = useCallback((model: string) => {
    setSelectedModel(model)
  }, [])

  return {
    messages,
    isLoading,
    error,
    selectedModel,
    currentStreamedContent,
    sendMessage,
    clearChat,
    changeModel,
  }
}

/**
 * Code generation hook for programming tasks
 */
export function useCodeGeneration(config: UseAIConfig = {}) {
  const ai = useAI({
    ...config,
    model: config.model || "openai/gpt-4o", // Use more capable model for coding
    temperature: config.temperature || 0.2, // Lower temperature for code
  })

  const generateCode = useCallback(
    async (prompt: string, language?: string, context?: string): Promise<AIResponse | null> => {
      const systemMessage = `You are an expert programmer. Generate high-quality, well-documented code.
${language ? `Focus on ${language} programming language.` : ""}
${context ? `Context: ${context}` : ""}
Provide clean, efficient, and well-commented code.`

      return ai.generate(prompt, systemMessage)
    },
    [ai.generate],
  )

  const reviewCode = useCallback(
    async (code: string, language?: string): Promise<AIResponse | null> => {
      const systemMessage = `You are a senior code reviewer. Analyze the following code for:
- Code quality and best practices
- Performance optimizations
- Security vulnerabilities
- Maintainability and readability
${language ? `Language: ${language}` : ""}

Provide specific, actionable feedback.`

      return ai.generate(`Please review this code:\n\n${code}`, systemMessage)
    },
    [ai.generate],
  )

  const explainCode = useCallback(
    async (code: string, language?: string): Promise<AIResponse | null> => {
      const systemMessage = `You are a programming instructor. Explain code clearly and comprehensively.
${language ? `Language: ${language}` : ""}
Break down complex concepts, explain the logic flow, and highlight important patterns.`

      return ai.generate(`Please explain this code:\n\n${code}`, systemMessage)
    },
    [ai.generate],
  )

  return {
    ...ai,
    generateCode,
    reviewCode,
    explainCode,
  }
}

/**
 * Model selector hook for easy model switching
 */
export function useModelSelector() {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadModels = async () => {
      try {
        const client = getDefaultClient()
        const models = client.getAvailableModels()
        setAvailableModels(models)
        setIsLoading(false)
      } catch (error) {
        // Fallback models
        setAvailableModels([
          "openai/gpt-4o",
          "openai/gpt-4o-mini",
          "anthropic/claude-3.5-sonnet",
          "anthropic/claude-3-haiku",
          "google/gemini-pro-1.5",
          "meta-llama/llama-3.1-70b-instruct",
        ])
        setIsLoading(false)
      }
    }

    loadModels()
  }, [])

  const selectModel = useCallback((model: string) => {
    setSelectedModel(model)
  }, [])

  return {
    availableModels,
    selectedModel,
    selectModel,
    isLoading,
  }
}

// ===== NEW FEATURES: Doubling Opencode Capabilities =====

/**
 * Multi-Agent Workflow System - Advanced AI Orchestration
 * Enables complex AI workflows with multiple agents working together
 */
export interface Agent {
  id: string
  name: string
  role: string
  model: string
  systemMessage: string
  dependencies?: string[] // Agent IDs this agent depends on
  maxRetries?: number
}

export interface WorkflowStep {
  id: string
  agentId: string
  input: string
  output?: string
  status: "pending" | "running" | "completed" | "failed"
  error?: string
  startTime?: Date
  endTime?: Date
}

export interface Workflow {
  id: string
  name: string
  description: string
  agents: Agent[]
  steps: WorkflowStep[]
  status: "idle" | "running" | "completed" | "failed"
  results: Record<string, any>
}

export function useWorkflow() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const clientRef = useRef<OpenRouterClient | null>(null)

  useEffect(() => {
    try {
      clientRef.current = getDefaultClient()
    } catch (error) {
      console.error("AI client not initialized for workflow")
    }
  }, [])

  const createWorkflow = useCallback((name: string, description: string, agents: Agent[]): string => {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const workflow: Workflow = {
      id: workflowId,
      name,
      description,
      agents,
      steps: [],
      status: "idle",
      results: {},
    }

    setWorkflows((prev) => [...prev, workflow])
    return workflowId
  }, [])

  const addWorkflowStep = useCallback((workflowId: string, agentId: string, input: string): boolean => {
    setWorkflows((prev) =>
      prev.map((workflow) => {
        if (workflow.id !== workflowId) return workflow

        const step: WorkflowStep = {
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          agentId,
          input,
          status: "pending",
        }

        return {
          ...workflow,
          steps: [...workflow.steps, step],
        }
      }),
    )

    return true
  }, [])

  const executeWorkflow = useCallback(
    async (workflowId: string): Promise<Workflow | null> => {
      if (!clientRef.current) return null

      setIsRunning(true)
      let workflow = workflows.find((w) => w.id === workflowId)
      if (!workflow) return null

      setCurrentWorkflow(workflow)

      // Update workflow status
      setWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, status: "running" } : w)))

      try {
        const results: Record<string, any> = {}

        // Execute steps in dependency order
        const executedSteps = new Set<string>()

        for (const step of workflow.steps) {
          // Check dependencies
          const agent = workflow.agents.find((a) => a.id === step.agentId)
          if (agent?.dependencies) {
            const unmetDeps = agent.dependencies.filter((dep) => !executedSteps.has(dep))
            if (unmetDeps.length > 0) {
              throw new Error(`Agent ${agent.id} has unmet dependencies: ${unmetDeps.join(", ")}`)
            }
          }

          // Update step status
          setWorkflows((prev) =>
            prev.map((w) => ({
              ...w,
              steps: w.steps.map((s) => (s.id === step.id ? { ...s, status: "running", startTime: new Date() } : s)),
            })),
          )

          // Execute agent
          const agent = workflow.agents.find((a) => a.id === step.agentId)
          if (!agent) continue

          let success = false
          let attempts = 0
          const maxRetries = agent.maxRetries || 3

          while (!success && attempts < maxRetries) {
            try {
              const messages: AIMessage[] = [
                { role: "system", content: agent.systemMessage },
                { role: "user", content: step.input },
              ]

              const response = await clientRef.current.generate(messages, {
                model: agent.model,
                temperature: 0.7,
              })

              results[step.id] = response.content
              executedSteps.add(step.agentId)

              // Update step status
              setWorkflows((prev) =>
                prev.map((w) => ({
                  ...w,
                  steps: w.steps.map((s) =>
                    s.id === step.id
                      ? {
                          ...s,
                          status: "completed",
                          output: response.content,
                          endTime: new Date(),
                        }
                      : s,
                  ),
                  results: { ...w.results, [step.id]: response.content },
                })),
              )

              success = true
            } catch (error) {
              attempts++
              if (attempts >= maxRetries) {
                setWorkflows((prev) =>
                  prev.map((w) => ({
                    ...w,
                    steps: w.steps.map((s) =>
                      s.id === step.id
                        ? {
                            ...s,
                            status: "failed",
                            error: error instanceof Error ? error.message : "Unknown error",
                            endTime: new Date(),
                          }
                        : s,
                    ),
                  })),
                )
                throw error
              }
            }
          }
        }

        // Mark workflow as completed
        setWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, status: "completed", results } : w)))

        setIsRunning(false)
        return workflows.find((w) => w.id === workflowId) || null
      } catch (error) {
        setWorkflows((prev) => prev.map((w) => (w.id === workflowId ? { ...w, status: "failed" } : w)))
        setIsRunning(false)
        return null
      }
    },
    [workflows],
  )

  const getWorkflow = useCallback(
    (workflowId: string): Workflow | null => {
      return workflows.find((w) => w.id === workflowId) || null
    },
    [workflows],
  )

  const deleteWorkflow = useCallback(
    (workflowId: string): boolean => {
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId))
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null)
      }
      return true
    },
    [currentWorkflow],
  )

  return {
    workflows,
    currentWorkflow,
    isRunning,
    createWorkflow,
    addWorkflowStep,
    executeWorkflow,
    getWorkflow,
    deleteWorkflow,
  }
}

/**
 * AI-Powered Code Suggestions - Enhanced Developer Experience
 * Provides intelligent code completion and suggestions
 */
export interface CodeSuggestion {
  id: string
  type: "completion" | "refactor" | "optimization" | "bugfix"
  content: string
  description: string
  confidence: number
  lineNumber?: number
  language: string
}

export function useCodeSuggestions(config: UseAIConfig = {}) {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const ai = useAI({ ...config, model: config.model || "openai/gpt-4o" })

  const analyzeCode = useCallback(
    async (code: string, language: string, context?: string): Promise<CodeSuggestion[]> => {
      if (!code.trim()) return []

      setIsAnalyzing(true)

      try {
        const prompt = `Analyze this ${language} code and provide intelligent suggestions for improvements, completions, and optimizations.

Code:
${code}

${context ? `Context: ${context}` : ""}

Provide suggestions in this JSON format:
[
  {
    "type": "completion|refactor|optimization|bugfix",
    "content": "suggested code",
    "description": "brief explanation",
    "confidence": 0.0-1.0,
    "lineNumber": 1
  }
]

Focus on:
- Code completion suggestions
- Performance optimizations
- Best practices improvements
- Bug fixes
- Refactoring opportunities`

        const response = await ai.generate(
          prompt,
          "You are an expert code analyst. Provide JSON-formatted suggestions only.",
        )

        if (response) {
          try {
            const parsed = JSON.parse(response.content)
            const formattedSuggestions: CodeSuggestion[] = parsed.map((s: any, index: number) => ({
              id: `suggestion_${Date.now()}_${index}`,
              type: s.type || "refactor",
              content: s.content || "",
              description: s.description || "",
              confidence: s.confidence || 0.5,
              lineNumber: s.lineNumber,
              language,
            }))

            setSuggestions(formattedSuggestions)
            return formattedSuggestions
          } catch (parseError) {
            console.error("Failed to parse AI suggestions:", parseError)
            return []
          }
        }

        return []
      } finally {
        setIsAnalyzing(false)
      }
    },
    [ai],
  )

  const getSuggestionsForLine = useCallback(
    (lineNumber: number): CodeSuggestion[] => {
      return suggestions.filter((s) => s.lineNumber === lineNumber)
    },
    [suggestions],
  )

  const applySuggestion = useCallback(
    (suggestionId: string): CodeSuggestion | null => {
      const suggestion = suggestions.find((s) => s.id === suggestionId)
      if (suggestion) {
        // Mark as applied (you could implement actual code application logic here)
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
        return suggestion
      }
      return null
    },
    [suggestions],
  )

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  return {
    suggestions,
    isAnalyzing,
    analyzeCode,
    getSuggestionsForLine,
    applySuggestion,
    clearSuggestions,
  }
}

// Re-export the comprehensive analytics hook from separate file
export { useAnalytics, type UsageMetrics, type CallHistoryEntry } from "./useAnalytics"

// Export BMAD workflow components
export { BusinessAnalystAgent, type RequirementsOutput } from "./agents/BusinessAnalyst"
export { MethodDesignerAgent, type TechnicalApproachOutput } from "./agents/MethodDesigner"
export { ArchitectAgent, type ArchitectureOutput } from "./agents/Architect"
export { DeveloperAgent, type CodeOutput } from "./agents/Developer"
export { BaseAgent, type AgentContext, type AgentOutput } from "./agents/BaseAgent"
export {
  BMADWorkflow,
  type WorkflowPhase,
  type BMADWorkflowState,
  type BMADWorkflowResult,
} from "./workflow/BMADWorkflow"
export { useBMADWorkflow, type UseBMADWorkflowOptions, type UseBMADWorkflowReturn } from "./useBMADWorkflow"

/**
 * Smart Caching System - Performance & Scale
 * Intelligent response caching with invalidation
 */
export interface CacheEntry {
  id: string
  key: string
  content: string
  model: string
  timestamp: Date
  ttl: number // Time to live in milliseconds
  hits: number
  metadata?: Record<string, any>
}

export function useCache(maxSize: number = 1000, defaultTTL: number = 3600000) {
  // 1 hour default
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map())
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
  })

  // Clean expired entries
  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prev) => {
        const now = Date.now()
        const newCache = new Map()

        for (const [key, entry] of prev) {
          if (now - entry.timestamp.getTime() < entry.ttl) {
            newCache.set(key, entry)
          } else {
            setStats((prevStats) => ({ ...prevStats, evictions: prevStats.evictions + 1 }))
          }
        }

        return newCache
      })
    }, 60000) // Clean every minute

    return () => clearInterval(interval)
  }, [])

  const generateKey = useCallback((messages: AIMessage[], model: string, options?: any): string => {
    const content = messages.map((m) => `${m.role}:${m.content}`).join("|")
    const optionsStr = options ? JSON.stringify(options) : ""
    return `${model}:${content}:${optionsStr}`
  }, [])

  const get = useCallback(
    (key: string): CacheEntry | null => {
      const entry = cache.get(key)
      if (!entry) {
        setStats((prev) => ({ ...prev, misses: prev.misses + 1 }))
        return null
      }

      // Check if expired
      if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
        setCache((prev) => {
          prev.delete(key)
          return new Map(prev)
        })
        setStats((prev) => ({ ...prev, evictions: prev.evictions + 1 }))
        return null
      }

      // Update hit count
      setCache((prev) => {
        const newEntry = { ...entry, hits: entry.hits + 1 }
        prev.set(key, newEntry)
        return new Map(prev)
      })

      setStats((prev) => ({ ...prev, hits: prev.hits + 1 }))
      return entry
    },
    [cache],
  )

  const set = useCallback(
    (key: string, content: string, model: string, ttl?: number, metadata?: Record<string, any>): void => {
      const entry: CacheEntry = {
        id: `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key,
        content,
        model,
        timestamp: new Date(),
        ttl: ttl || defaultTTL,
        hits: 0,
        metadata,
      }

      setCache((prev) => {
        const newCache = new Map(prev)

        // Evict if at capacity (simple LRU-like behavior)
        if (newCache.size >= maxSize) {
          let oldestKey = ""
          let oldestTime = Date.now()

          for (const [k, e] of newCache) {
            if (e.timestamp.getTime() < oldestTime) {
              oldestTime = e.timestamp.getTime()
              oldestKey = k
            }
          }

          if (oldestKey) {
            newCache.delete(oldestKey)
            setStats((prevStats) => ({ ...prevStats, evictions: prevStats.evictions + 1 }))
          }
        }

        newCache.set(key, entry)
        return newCache
      })

      setStats((prev) => ({ ...prev, size: prev.size + 1 }))
    },
    [maxSize, defaultTTL],
  )

  const invalidate = useCallback(
    (pattern?: string): number => {
      if (!pattern) {
        const size = cache.size
        setCache(new Map())
        setStats((prev) => ({ ...prev, evictions: prev.evictions + size, size: 0 }))
        return size
      }

      let removed = 0
      setCache((prev) => {
        const newCache = new Map()
        for (const [key, entry] of prev) {
          if (key.includes(pattern)) {
            removed++
          } else {
            newCache.set(key, entry)
          }
        }
        return newCache
      })

      setStats((prev) => ({
        ...prev,
        evictions: prev.evictions + removed,
        size: prev.size - removed,
      }))

      return removed
    },
    [cache],
  )

  const getStats = useCallback(
    () => ({
      ...stats,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0,
    }),
    [stats],
  )

  return {
    get,
    set,
    invalidate,
    getStats,
    generateKey,
  }
}

/**
 * Real-time Collaboration - Enhanced Developer Experience
 * Enables multiple users to collaborate on AI interactions
 */
export interface CollaborationSession {
  id: string
  name: string
  participants: string[]
  messages: AIMessage[]
  currentModel: string
  isActive: boolean
  createdAt: Date
  lastActivity: Date
}

export interface CollaborationMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  type: "message" | "model_change" | "join" | "leave"
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export function useCollaboration(userId: string, userName: string) {
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
  const [messages, setMessages] = useState<CollaborationMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Mock real-time functionality (in real app, use WebSocket/Socket.io)
  const createSession = useCallback(
    (name: string): string => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const session: CollaborationSession = {
        id: sessionId,
        name,
        participants: [userId],
        messages: [],
        currentModel: "openai/gpt-4o-mini",
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      setSessions((prev) => [...prev, session])
      setCurrentSession(session)
      setIsConnected(true)

      // Add join message
      const joinMessage: CollaborationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        userId,
        userName,
        type: "join",
        content: `${userName} joined the session`,
        timestamp: new Date(),
      }
      setMessages([joinMessage])

      return sessionId
    },
    [userId, userName],
  )

  const joinSession = useCallback(
    (sessionId: string): boolean => {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session || !session.isActive) return false

      setCurrentSession(session)
      setIsConnected(true)

      // Update participants
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, participants: [...new Set([...s.participants, userId])], lastActivity: new Date() }
            : s,
        ),
      )

      // Add join message
      const joinMessage: CollaborationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        userId,
        userName,
        type: "join",
        content: `${userName} joined the session`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, joinMessage])

      return true
    },
    [sessions, userId, userName],
  )

  const leaveSession = useCallback((): void => {
    if (!currentSession) return

    // Add leave message
    const leaveMessage: CollaborationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: currentSession.id,
      userId,
      userName,
      type: "leave",
      content: `${userName} left the session`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, leaveMessage])

    // Update participants
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? { ...s, participants: s.participants.filter((p) => p !== userId), lastActivity: new Date() }
          : s,
      ),
    )

    setCurrentSession(null)
    setIsConnected(false)
  }, [currentSession, userId, userName])

  const sendCollaborativeMessage = useCallback(
    async (content: string, type: "message" | "model_change" = "message"): Promise<boolean> => {
      if (!currentSession || !isConnected) return false

      const message: CollaborationMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: currentSession.id,
        userId,
        userName,
        type,
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, message])

      // Update session activity
      setSessions((prev) => prev.map((s) => (s.id === currentSession.id ? { ...s, lastActivity: new Date() } : s)))

      return true
    },
    [currentSession, isConnected, userId, userName],
  )

  const changeModel = useCallback(
    async (model: string): Promise<boolean> => {
      if (!currentSession) return false

      // Update session model
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSession.id ? { ...s, currentModel: model, lastActivity: new Date() } : s)),
      )

      // Send model change message
      return sendCollaborativeMessage(`Changed model to ${model}`, "model_change")
    },
    [currentSession, sendCollaborativeMessage],
  )

  const getActiveSessions = useCallback((): CollaborationSession[] => {
    return sessions.filter((s) => s.isActive)
  }, [sessions])

  const getSessionMessages = useCallback(
    (sessionId: string): CollaborationMessage[] => {
      return messages.filter((m) => m.sessionId === sessionId)
    },
    [messages],
  )

  return {
    sessions: getActiveSessions(),
    currentSession,
    messages: currentSession ? getSessionMessages(currentSession.id) : [],
    isConnected,
    createSession,
    joinSession,
    leaveSession,
    sendCollaborativeMessage,
    changeModel,
  }
}
