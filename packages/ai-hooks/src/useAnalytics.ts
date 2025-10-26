/**
 * Enterprise Analytics Hook
 * Comprehensive usage tracking, cost management, and performance monitoring
 */

import { useState, useEffect, useCallback, useRef } from "react"

export interface UsageMetrics {
  totalRequests: number
  totalTokens: number
  totalCost: number
  averageResponseTime: number
  modelUsage: Record<
    string,
    {
      requests: number
      tokens: number
      cost: number
      avgResponseTime: number
    }
  >
  dailyUsage: Record<string, { requests: number; tokens: number; cost: number }>
  errorRate: number
  topPrompts: Array<{
    prompt: string
    count: number
    avgTokens: number
  }>
}

export interface CallHistoryEntry {
  id: string
  timestamp: Date
  model: string
  prompt: string
  response?: string
  totalTokens: number
  responseTime: number
  cost: number
  success: boolean
}

export interface CostLimits {
  dailyLimit: number
  monthlyLimit: number
  warningThreshold: number // percentage
}

export interface AnalyticsConfig {
  enableTracking: boolean
  costLimits?: CostLimits
  retentionDays: number
  onLimitExceeded?: (type: "daily" | "monthly", currentCost: number) => void
  onWarning?: (type: "daily" | "monthly", currentCost: number, limit: number) => void
}

const STORAGE_KEY = "opencode_analytics"
const HISTORY_STORAGE_KEY = "opencode_call_history"

// Cost per 1K tokens (approximate, should be updated with actual pricing)
const MODEL_COSTS = {
  "openai/gpt-4o": { input: 0.005, output: 0.015 },
  "openai/gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "anthropic/claude-3.5-sonnet": { input: 0.003, output: 0.015 },
  "anthropic/claude-3-haiku": { input: 0.00025, output: 0.00125 },
  "google/gemini-pro-1.5": { input: 0.00125, output: 0.005 },
  "meta-llama/llama-3.1-70b-instruct": { input: 0.0002, output: 0.0002 },
}

export function useAnalytics(config: AnalyticsConfig = { enableTracking: true, retentionDays: 30 }) {
  const [metrics, setMetrics] = useState<UsageMetrics>({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    averageResponseTime: 0,
    modelUsage: {},
    dailyUsage: {},
    errorRate: 0,
    topPrompts: [],
  })

  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([])
  const [isTracking, setIsTracking] = useState(config.enableTracking)
  const [isLoading, setIsLoading] = useState(true)
  const requestTimesRef = useRef<Map<string, number>>(new Map())
  const errorCountRef = useRef(0)

  // Load analytics from localStorage
  useEffect(() => {
    if (!isTracking) {
      setIsLoading(false)
      return
    }

    try {
      const storedMetrics = localStorage.getItem(STORAGE_KEY)
      if (storedMetrics) {
        const parsed = JSON.parse(storedMetrics)
        // Convert dailyStats array to dailyUsage object for compatibility
        if (parsed.dailyStats) {
          parsed.dailyUsage = parsed.dailyStats.reduce((acc: Record<string, any>, stat: any) => {
            acc[stat.date] = { requests: stat.requests, tokens: stat.tokens, cost: stat.cost }
            return acc
          }, {})
          delete parsed.dailyStats
        }
        setMetrics(parsed)
      }

      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory)
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsedHistory.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
        setCallHistory(historyWithDates)
      }
    } catch (error) {
      console.warn("Failed to load analytics:", error)
    }
    setIsLoading(false)
  }, [isTracking])

  // Save analytics to localStorage
  const saveMetrics = useCallback(
    (newMetrics: UsageMetrics) => {
      if (!isTracking) return

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMetrics))
      } catch (error) {
        console.warn("Failed to save analytics:", error)
      }
    },
    [isTracking],
  )

  // Save call history to localStorage
  const saveCallHistory = useCallback(
    (newHistory: CallHistoryEntry[]) => {
      if (!isTracking) return

      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory))
      } catch (error) {
        console.warn("Failed to save call history:", error)
      }
    },
    [isTracking],
  )

  // Track a request
  const trackRequest = useCallback(
    (
      model: string,
      prompt: string,
      response?: string,
      tokens?: { prompt: number; completion: number },
      error?: boolean,
    ) => {
      if (!isTracking) return

      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const startTime = requestTimesRef.current.get(requestId) || Date.now()

      setMetrics((prev) => {
        const newMetrics = { ...prev }

        // Update totals
        newMetrics.totalRequests += 1

        if (error) {
          errorCountRef.current += 1
        }

        // Calculate tokens and cost
        let requestTokens = 0
        let responseTokens = 0
        let cost = 0

        if (tokens) {
          requestTokens = tokens.prompt
          responseTokens = tokens.completion
          const totalTokens = requestTokens + responseTokens
          newMetrics.totalTokens += totalTokens

          // Calculate cost
          const modelCost = MODEL_COSTS[model as keyof typeof MODEL_COSTS]
          if (modelCost) {
            cost = (requestTokens / 1000) * modelCost.input + (responseTokens / 1000) * modelCost.output
            newMetrics.totalCost += cost
          }
        }

        // Update model usage
        if (!newMetrics.modelUsage[model]) {
          newMetrics.modelUsage[model] = {
            requests: 0,
            tokens: 0,
            cost: 0,
            avgResponseTime: 0,
          }
        }

        const modelStats = newMetrics.modelUsage[model]
        modelStats.requests += 1
        modelStats.tokens += requestTokens + responseTokens
        modelStats.cost += cost

        // Calculate response time
        const responseTime = Date.now() - startTime
        const totalRequests = modelStats.requests
        modelStats.avgResponseTime = (modelStats.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests

        // Update overall average response time
        newMetrics.averageResponseTime =
          (newMetrics.averageResponseTime * (newMetrics.totalRequests - 1) + responseTime) / newMetrics.totalRequests

        // Update error rate
        newMetrics.errorRate = errorCountRef.current / newMetrics.totalRequests

        // Update daily usage
        const today = new Date().toISOString().split("T")[0]
        if (!newMetrics.dailyUsage[today]) {
          newMetrics.dailyUsage[today] = { requests: 0, tokens: 0, cost: 0 }
        }
        newMetrics.dailyUsage[today].requests += 1
        newMetrics.dailyUsage[today].tokens += requestTokens + responseTokens
        newMetrics.dailyUsage[today].cost += cost

        // Clean up old daily usage data
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays)
        const cutoffKey = cutoffDate.toISOString().split("T")[0]
        Object.keys(newMetrics.dailyUsage).forEach((date) => {
          if (date < cutoffKey) {
            delete newMetrics.dailyUsage[date]
          }
        })

        // Update top prompts
        const existingPrompt = newMetrics.topPrompts.find((p) => p.prompt === prompt)
        if (existingPrompt) {
          existingPrompt.count += 1
          existingPrompt.avgTokens =
            (existingPrompt.avgTokens * (existingPrompt.count - 1) + (requestTokens + responseTokens)) /
            existingPrompt.count
        } else {
          newMetrics.topPrompts.push({
            prompt: prompt.length > 100 ? prompt.substring(0, 100) + "..." : prompt,
            count: 1,
            avgTokens: requestTokens + responseTokens,
          })
        }

        newMetrics.topPrompts = newMetrics.topPrompts.sort((a, b) => b.count - a.count).slice(0, 10)

        // Check cost limits
        if (config.costLimits) {
          const { dailyLimit, monthlyLimit, warningThreshold } = config.costLimits

          // Daily check
          const todayCost = newMetrics.dailyUsage[today]?.cost || 0
          if (todayCost >= dailyLimit * (warningThreshold / 100)) {
            config.onWarning?.("daily", todayCost, dailyLimit)
          }
          if (todayCost >= dailyLimit) {
            config.onLimitExceeded?.("daily", todayCost)
          }

          // Monthly check
          const monthStart = new Date()
          monthStart.setDate(1)
          const monthlyCost = Object.entries(newMetrics.dailyUsage)
            .filter(([date]) => new Date(date) >= monthStart)
            .reduce((sum, [, usage]) => sum + usage.cost, 0)

          if (monthlyCost >= monthlyLimit * (warningThreshold / 100)) {
            config.onWarning?.("monthly", monthlyCost, monthlyLimit)
          }
          if (monthlyCost >= monthlyLimit) {
            config.onLimitExceeded?.("monthly", monthlyCost)
          }
        }

        saveMetrics(newMetrics)
        return newMetrics
      })

      // Add to call history
      const responseTime = Date.now() - startTime
      const totalTokens = tokens ? tokens.prompt + tokens.completion : 0
      const cost = tokens
        ? (() => {
            const modelCost = MODEL_COSTS[model as keyof typeof MODEL_COSTS]
            return modelCost
              ? (tokens.prompt / 1000) * modelCost.input + (tokens.completion / 1000) * modelCost.output
              : 0
          })()
        : 0

      const historyEntry: CallHistoryEntry = {
        id: requestId,
        timestamp: new Date(),
        model,
        prompt,
        response,
        totalTokens,
        responseTime,
        cost,
        success: !error,
      }

      setCallHistory((prev) => {
        const newHistory = [historyEntry, ...prev].slice(0, 1000) // Keep last 1000 entries
        saveCallHistory(newHistory)
        return newHistory
      })

      requestTimesRef.current.delete(requestId)
    },
    [isTracking, config, saveMetrics, saveCallHistory],
  )

  // Start tracking a request
  const startRequest = useCallback(
    (requestId?: string) => {
      if (!config.enableTracking) return requestId || `req_${Date.now()}`

      const id = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      requestTimesRef.current.set(id, Date.now())
      return id
    },
    [config.enableTracking],
  )

  // Get call history
  const getCallHistory = useCallback(
    (limit?: number) => {
      return callHistory.slice(0, limit || 100)
    },
    [callHistory],
  )

  // Clear call history
  const clearHistory = useCallback(() => {
    setCallHistory([])
    saveCallHistory([])
  }, [saveCallHistory])

  // Clear analytics
  const clearAnalytics = useCallback(() => {
    const emptyMetrics: UsageMetrics = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      modelUsage: {},
      dailyUsage: {},
      errorRate: 0,
      topPrompts: [],
    }
    setMetrics(emptyMetrics)
    saveMetrics(emptyMetrics)
    errorCountRef.current = 0
    requestTimesRef.current.clear()
  }, [saveMetrics])

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    return JSON.stringify(metrics, null, 2)
  }, [metrics])

  return {
    metrics,
    getCallHistory,
    clearHistory,
    isTracking,
    setTracking,
    isLoading,
    trackRequest,
    startRequest,
    clearAnalytics,
    exportAnalytics,
  }
}
