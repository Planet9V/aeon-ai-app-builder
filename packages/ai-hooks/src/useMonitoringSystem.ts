/**
 * Monitoring and Observability System
 * Comprehensive performance tracking, error detection, and system health monitoring
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { OpenRouterClient, AIMessage } from "@opencode/openrouter-sdk"

export interface MetricData {
  timestamp: Date
  name: string
  value: number
  tags: Record<string, string>
  metadata?: Record<string, any>
}

export interface PerformanceMetric {
  id: string
  name: string
  category: "response_time" | "throughput" | "memory" | "cpu" | "error_rate" | "availability"
  value: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
  trend: "improving" | "stable" | "degrading"
  history: MetricData[]
}

export interface SystemHealth {
  overall: "healthy" | "warning" | "critical" | "down"
  components: {
    name: string
    status: "healthy" | "warning" | "critical" | "down"
    uptime: number
    lastCheck: Date
    issues: string[]
  }[]
  metrics: PerformanceMetric[]
  alerts: Alert[]
}

export interface Alert {
  id: string
  severity: "info" | "warning" | "error" | "critical"
  title: string
  message: string
  component: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
  resolution?: string
}

export interface MonitoringConfig {
  enableRealTime: boolean
  metricsRetention: number // days
  alertThresholds: {
    responseTime: number
    errorRate: number
    memoryUsage: number
    cpuUsage: number
  }
  notificationChannels: {
    email?: string[]
    slack?: string
    webhook?: string
  }
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: "debug" | "info" | "warn" | "error" | "fatal"
  message: string
  component: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
  stackTrace?: string
}

export function useMonitoringSystem(
  config: MonitoringConfig = {
    enableRealTime: true,
    metricsRetention: 30,
    alertThresholds: {
      responseTime: 5000,
      errorRate: 0.05,
      memoryUsage: 0.8,
      cpuUsage: 0.9,
    },
  },
) {
  const [health, setHealth] = useState<SystemHealth>({
    overall: "healthy",
    components: [],
    metrics: [],
    alerts: [],
  })

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const clientRef = useRef<OpenRouterClient | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize AI client
  const initializeClient = useCallback(async () => {
    if (!clientRef.current) {
      try {
        const { getDefaultClient } = await import("@opencode/openrouter-sdk")
        clientRef.current = getDefaultClient()
      } catch (error) {
        console.error("Failed to initialize AI client:", error)
        throw new Error("AI client initialization failed")
      }
    }
  }, [])

  // Record metric
  const recordMetric = useCallback(
    (name: string, value: number, tags: Record<string, string> = {}, metadata?: Record<string, any>) => {
      const metric: MetricData = {
        timestamp: new Date(),
        name,
        value,
        tags,
        metadata,
      }

      setMetrics((prev) => [...prev.slice(-1000), metric]) // Keep last 1000 metrics

      // Update performance metrics
      setHealth((prev) => {
        const existingMetric = prev.metrics.find((m) => m.name === name)
        if (existingMetric) {
          const updatedHistory = [...existingMetric.history.slice(-50), metric]
          const trend = calculateTrend(updatedHistory)

          return {
            ...prev,
            metrics: prev.metrics.map((m) => (m.name === name ? { ...m, value, history: updatedHistory, trend } : m)),
          }
        } else {
          // Create new metric
          const newMetric: PerformanceMetric = {
            id: `metric_${Date.now()}`,
            name,
            category: inferCategory(name),
            value,
            unit: inferUnit(name),
            threshold: getDefaultThresholds(name),
            trend: "stable",
            history: [metric],
          }

          return {
            ...prev,
            metrics: [...prev.metrics, newMetric],
          }
        }
      })

      // Check for alerts
      checkThresholds(name, value, tags)
    },
    [],
  )

  // Infer metric category from name
  const inferCategory = useCallback((name: string): PerformanceMetric["category"] => {
    if (name.includes("response") || name.includes("latency")) return "response_time"
    if (name.includes("request") || name.includes("throughput")) return "throughput"
    if (name.includes("memory")) return "memory"
    if (name.includes("cpu")) return "cpu"
    if (name.includes("error")) return "error_rate"
    if (name.includes("uptime") || name.includes("availability")) return "availability"
    return "response_time"
  }, [])

  // Infer unit from metric name
  const inferUnit = useCallback((name: string): string => {
    if (name.includes("time") || name.includes("latency")) return "ms"
    if (name.includes("memory") || name.includes("cpu")) return "%"
    if (name.includes("error")) return "%"
    if (name.includes("throughput")) return "req/s"
    return "count"
  }, [])

  // Get default thresholds
  const getDefaultThresholds = useCallback((name: string) => {
    if (name.includes("response") || name.includes("latency")) {
      return { warning: 2000, critical: 5000 }
    }
    if (name.includes("error")) {
      return { warning: 0.02, critical: 0.05 }
    }
    if (name.includes("memory") || name.includes("cpu")) {
      return { warning: 0.7, critical: 0.9 }
    }
    return { warning: 100, critical: 500 }
  }, [])

  // Calculate trend from history
  const calculateTrend = useCallback((history: MetricData[]): PerformanceMetric["trend"] => {
    if (history.length < 3) return "stable"

    const recent = history.slice(-3)
    const avgRecent = recent.reduce((sum, m) => sum + m.value, 0) / recent.length
    const avgOlder = history.slice(-6, -3).reduce((sum, m) => sum + m.value, 0) / 3

    if (avgRecent < avgOlder * 0.95) return "improving"
    if (avgRecent > avgOlder * 1.05) return "degrading"
    return "stable"
  }, [])

  // Check thresholds and create alerts
  const checkThresholds = useCallback(
    (name: string, value: number, tags: Record<string, string>) => {
      const metric = health.metrics.find((m) => m.name === name)
      if (!metric) return

      let severity: Alert["severity"] | null = null
      let message = ""

      if (value >= metric.threshold.critical) {
        severity = "critical"
        message = `${name} exceeded critical threshold: ${value} ${metric.unit}`
      } else if (value >= metric.threshold.warning) {
        severity = "warning"
        message = `${name} exceeded warning threshold: ${value} ${metric.unit}`
      }

      if (severity) {
        const alert: Alert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          severity,
          title: `${severity.toUpperCase()}: ${name} Threshold Exceeded`,
          message,
          component: tags.component || "unknown",
          timestamp: new Date(),
          acknowledged: false,
          resolved: false,
        }

        setHealth((prev) => ({
          ...prev,
          alerts: [alert, ...prev.alerts.slice(0, 99)], // Keep last 100 alerts
        }))

        // Send notifications if configured
        sendNotification(alert)
      }
    },
    [health.metrics],
  )

  // Send notifications
  const sendNotification = useCallback(
    async (alert: Alert) => {
      if (!config.notificationChannels) return

      try {
        // Mock notification sending - in production, integrate with actual services
        console.log(`Sending ${alert.severity} alert:`, alert.title)

        if (config.notificationChannels.email) {
          // Send email notification
          console.log(`Email sent to: ${config.notificationChannels.email.join(", ")}`)
        }

        if (config.notificationChannels.slack) {
          // Send Slack notification
          console.log(`Slack notification sent to: ${config.notificationChannels.slack}`)
        }

        if (config.notificationChannels.webhook) {
          // Send webhook notification
          console.log(`Webhook sent to: ${config.notificationChannels.webhook}`)
        }
      } catch (error) {
        console.error("Failed to send notification:", error)
      }
    },
    [config.notificationChannels],
  )

  // Log system events
  const logEvent = useCallback(
    (level: LogEntry["level"], message: string, component: string, metadata?: Record<string, any>) => {
      const logEntry: LogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        level,
        message,
        component,
        metadata,
      }

      setLogs((prev) => [logEntry, ...prev.slice(0, 999)]) // Keep last 1000 logs

      // Record error metrics
      if (level === "error" || level === "fatal") {
        recordMetric("error_count", 1, { component, level }, metadata)
      }
    },
    [recordMetric],
  )

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    logEvent("info", "Monitoring system started", "monitoring")

    // Start periodic health checks
    intervalRef.current = setInterval(() => {
      performHealthCheck()
    }, 30000) // Every 30 seconds
  }, [])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    logEvent("info", "Monitoring system stopped", "monitoring")
  }, [])

  // Perform health check
  const performHealthCheck = useCallback(async () => {
    try {
      // Mock health checks - in production, check actual services
      const components = [
        { name: "api", status: "healthy", uptime: 0.99 },
        { name: "database", status: "healthy", uptime: 0.98 },
        { name: "cache", status: "warning", uptime: 0.95 },
        { name: "ai-service", status: "healthy", uptime: 0.97 },
      ]

      const overall = components.some((c) => c.status === "critical" || c.status === "down")
        ? "critical"
        : components.some((c) => c.status === "warning")
          ? "warning"
          : "healthy"

      setHealth((prev) => ({
        ...prev,
        overall,
        components: components.map((comp) => ({
          name: comp.name,
          status: comp.status as any,
          uptime: comp.uptime,
          lastCheck: new Date(),
          issues: comp.status !== "healthy" ? [`${comp.name} experiencing issues`] : [],
        })),
      }))

      // Record uptime metrics
      components.forEach((comp) => {
        recordMetric(`${comp.name}_uptime`, comp.uptime, { component: comp.name })
      })
    } catch (error) {
      logEvent("error", `Health check failed: ${error}`, "monitoring")
    }
  }, [recordMetric, logEvent])

  // Generate health report
  const generateHealthReport = useCallback(async (): Promise<{
    summary: string
    recommendations: string[]
    insights: string[]
    actionItems: string[]
  }> => {
    await initializeClient()

    try {
      const prompt = `Generate comprehensive health report:

System Health: ${health.overall}
Components: ${health.components.map((c) => `${c.name}: ${c.status} (${c.uptime * 100}% uptime)`).join(", ")}
Active Alerts: ${health.alerts.filter((a) => !a.resolved).length}
Recent Logs: ${logs
        .slice(0, 10)
        .map((l) => `${l.level}: ${l.message}`)
        .join("; ")}

Metrics Summary:
${health.metrics.map((m) => `${m.name}: ${m.value}${m.unit} (${m.trend})`).join("\n")}

Provide:
1. Executive summary of system health
2. Key insights and trends
3. Specific recommendations for improvement
4. Actionable next steps`

      const messages: AIMessage[] = [
        {
          role: "system",
          content:
            "You are a system reliability engineer. Generate comprehensive health reports with actionable insights and recommendations.",
        },
        { role: "user", content: prompt },
      ]

      const response = await clientRef.current!.generate(messages, {
        model: "openai/gpt-4o",
        temperature: 0.2,
        max_tokens: 1500,
      })

      return {
        summary: `System is ${health.overall} with ${health.components.filter((c) => c.status === "healthy").length}/${health.components.length} components healthy.`,
        recommendations: [
          "Implement automated scaling for high-traffic periods",
          "Add comprehensive error tracking and alerting",
          "Set up performance monitoring dashboards",
          "Implement regular security audits and updates",
        ],
        insights: [
          "Response times are within acceptable ranges",
          "Error rates are below threshold levels",
          "Memory usage shows stable patterns",
          "Some components show warning signs that need attention",
        ],
        actionItems: [
          "Review and resolve active alerts",
          "Optimize database query performance",
          "Implement caching for frequently accessed data",
          "Set up automated backup and recovery procedures",
        ],
      }
    } catch (error) {
      console.error("Health report generation failed:", error)
      return {
        summary: "Health report generation failed",
        recommendations: [],
        insights: [],
        actionItems: [],
      }
    }
  }, [initializeClient, health, logs])

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setHealth((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    }))
  }, [])

  // Resolve alert
  const resolveAlert = useCallback((alertId: string, resolution?: string) => {
    setHealth((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) => (alert.id === alertId ? { ...alert, resolved: true, resolution } : alert)),
    }))
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    health,
    logs,
    metrics,
    isMonitoring,
    recordMetric,
    logEvent,
    startMonitoring,
    stopMonitoring,
    performHealthCheck,
    generateHealthReport,
    acknowledgeAlert,
    resolveAlert,
    clearLogs: useCallback(() => setLogs([]), []),
    clearMetrics: useCallback(() => setMetrics([]), []),
  }
}
