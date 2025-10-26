/**
 * Analytics Dashboard Component - Enterprise-Grade Features
 * Comprehensive analytics for AI usage, costs, and performance metrics
 */

import React, { useState, useMemo } from "react"
import { useAnalytics } from "@opencode/ai-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, DollarSign, Clock, Zap, Calendar, Download, RefreshCw, Activity } from "lucide-react"

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className = "" }: AnalyticsDashboardProps) {
  const { metrics, getCallHistory, clearHistory, isTracking, setTracking } = useAnalytics()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [selectedTab, setSelectedTab] = useState("overview")

  const callHistory = useMemo(() => getCallHistory(100), [getCallHistory])

  const filteredMetrics = useMemo(() => {
    if (timeRange === "all") return metrics

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const cutoffKey = cutoffDate.toISOString().split("T")[0]

    const filteredDailyUsage: Record<string, { requests: number; tokens: number; cost: number }> = {}
    let totalRequests = 0
    let totalTokens = 0
    let totalCost = 0

    Object.entries(metrics.dailyUsage).forEach(([date, usage]) => {
      if (date >= cutoffKey) {
        filteredDailyUsage[date] = usage
        totalRequests += usage.requests
        totalTokens += usage.tokens
        totalCost += usage.cost
      }
    })

    return {
      ...metrics,
      totalRequests,
      totalTokens,
      totalCost,
      dailyUsage: filteredDailyUsage,
    }
  }, [metrics, timeRange])

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`
  const formatNumber = (num: number) => num.toLocaleString()
  const formatTime = (ms: number) => `${(ms / 1000).toFixed(2)}s`

  const exportData = () => {
    const data = {
      metrics: filteredMetrics,
      callHistory,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-analytics-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            AI Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor usage, costs, and performance metrics</p>
        </div>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant={isTracking ? "default" : "outline"} onClick={() => setTracking(!isTracking)}>
            <Activity className="w-4 h-4 mr-2" />
            {isTracking ? "Tracking On" : "Tracking Off"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{formatNumber(filteredMetrics.totalRequests)}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(filteredMetrics.totalCost)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{formatTime(filteredMetrics.averageResponseTime)}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">{formatNumber(filteredMetrics.totalTokens)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                    <p className="text-2xl font-bold">{(filteredMetrics.errorRate * 100).toFixed(1)}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{((1 - filteredMetrics.errorRate) * 100).toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tokens/Request</p>
                    <p className="text-2xl font-bold">
                      {filteredMetrics.totalRequests > 0
                        ? Math.round(filteredMetrics.totalTokens / filteredMetrics.totalRequests)
                        : 0}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Days</p>
                    <p className="text-2xl font-bold">{Object.keys(filteredMetrics.dailyUsage).length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Usage Breakdown with Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Model Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Simple pie chart visualization */}
                  {Object.keys(filteredMetrics.modelUsage).length > 0 && (
                    <div className="flex justify-center mb-6">
                      <div className="relative w-32 h-32">
                        {(() => {
                          const totalRequests = Object.values(filteredMetrics.modelUsage).reduce(
                            (sum, usage) => sum + usage.requests,
                            0,
                          )
                          let currentAngle = 0
                          const colors = [
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-yellow-500",
                            "bg-red-500",
                            "bg-purple-500",
                            "bg-pink-500",
                          ]

                          return Object.entries(filteredMetrics.modelUsage)
                            .sort(([, a], [, b]) => b.requests - a.requests)
                            .map(([model, usage], index) => {
                              const percentage = (usage.requests / totalRequests) * 100
                              const angle = (percentage / 100) * 360
                              const startAngle = currentAngle
                              currentAngle += angle

                              return (
                                <div
                                  key={model}
                                  className={`absolute inset-0 ${colors[index % colors.length]} rounded-full`}
                                  style={{
                                    background: `conic-gradient(from ${startAngle}deg, ${colors[index % colors.length].replace("bg-", "")} 0deg ${angle}deg, transparent ${angle}deg)`,
                                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((startAngle * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180)}% ${50 - 50 * Math.sin(((startAngle + angle) * Math.PI) / 180)}%)`,
                                  }}
                                />
                              )
                            })
                        })()}
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {Object.keys(filteredMetrics.modelUsage).length} models
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {Object.entries(filteredMetrics.modelUsage)
                      .sort(([, a], [, b]) => b.requests - a.requests)
                      .map(([model, usage]) => {
                        const totalRequests = Object.values(filteredMetrics.modelUsage).reduce(
                          (sum, u) => sum + u.requests,
                          0,
                        )
                        const percentage = totalRequests > 0 ? (usage.requests / totalRequests) * 100 : 0

                        return (
                          <div key={model} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <Badge variant="outline">{model.split("/")[0]}</Badge>
                              <span className="font-medium">{model.split("/")[1]}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {usage.requests} requests ({percentage.toFixed(1)}%)
                              </p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(usage.cost)}</p>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  {Object.keys(filteredMetrics.modelUsage).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No usage data available</p>
                      <p className="text-sm">Start using AI features to see analytics</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis with Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Cost</span>
                    <span className="text-lg font-bold">{formatCurrency(filteredMetrics.totalCost)}</span>
                  </div>

                  {/* Cost trend chart */}
                  {Object.keys(filteredMetrics.dailyUsage).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Daily Cost Trend</h4>
                      <div className="h-24 flex items-end gap-1 p-2 border rounded bg-muted/20">
                        {Object.entries(filteredMetrics.dailyUsage)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .slice(-7)
                          .map(([date, usage]) => {
                            const costs = Object.values(filteredMetrics.dailyUsage).map((u) => u.cost)
                            const maxCost = Math.max(...costs)
                            const height = maxCost > 0 ? (usage.cost / maxCost) * 100 : 0
                            return (
                              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                  className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                                  style={{ height: `${Math.max(height, 2)}%` }}
                                  title={`${formatCurrency(usage.cost)} on ${new Date(date).toLocaleDateString()}`}
                                />
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Cost per Model</h4>
                    {Object.entries(filteredMetrics.modelUsage)
                      .sort(([, a], [, b]) => b.cost - a.cost)
                      .slice(0, 5)
                      .map(([model, usage]) => (
                        <div key={model} className="flex justify-between text-sm">
                          <span>{model.split("/")[1]}</span>
                          <span>{formatCurrency(usage.cost)}</span>
                        </div>
                      ))}
                  </div>

                  {filteredMetrics.totalRequests > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Average cost per request</span>
                        <span>{formatCurrency(filteredMetrics.totalCost / filteredMetrics.totalRequests)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Model Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(filteredMetrics.modelUsage).map(([model, usage]) => (
                  <div key={model} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                          {model.split("/")[0]}
                        </Badge>
                        <h3 className="text-lg font-semibold">{model.split("/")[1]}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{usage.requests}</p>
                        <p className="text-sm text-muted-foreground">requests</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tokens Used</p>
                        <p className="text-lg font-medium">{formatNumber(usage.tokens)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-lg font-medium">{formatCurrency(usage.cost)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Tokens/Request</p>
                        <p className="text-lg font-medium">
                          {usage.requests > 0 ? Math.round(usage.tokens / usage.requests) : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost/Request</p>
                        <p className="text-lg font-medium">
                          {usage.requests > 0 ? formatCurrency(usage.cost / usage.requests) : "$0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {Object.keys(filteredMetrics.modelUsage).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No model usage data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {/* Usage Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">
                    Daily Usage Chart (Last {timeRange === "all" ? "Available" : timeRange})
                  </h4>
                  {Object.keys(filteredMetrics.dailyUsage).length > 0 ? (
                    <div className="space-y-4">
                      {/* Simple bar chart */}
                      <div className="h-64 flex items-end gap-2 p-4 border rounded-lg bg-muted/20">
                        {Object.entries(filteredMetrics.dailyUsage)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .slice(-14)
                          .map(([date, usage]) => {
                            const maxRequests = Math.max(
                              ...Object.values(filteredMetrics.dailyUsage).map((u) => u.requests),
                            )
                            const height = maxRequests > 0 ? (usage.requests / maxRequests) * 100 : 0
                            return (
                              <div key={date} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                                  style={{ height: `${Math.max(height, 2)}%` }}
                                  title={`${usage.requests} requests, ${formatCurrency(usage.cost)}`}
                                />
                                <span className="text-xs text-muted-foreground transform -rotate-45 origin-top">
                                  {new Date(date).toLocaleDateString().split("/")[1]}/
                                  {new Date(date).toLocaleDateString().split("/")[0]}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Daily requests (hover bars for cost details)
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No daily usage data available</p>
                    </div>
                  )}
                </div>

                {/* Detailed daily breakdown */}
                <div>
                  <h4 className="font-medium mb-4">Daily Breakdown</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Object.entries(filteredMetrics.dailyUsage)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 14)
                      .map(([date, usage]) => (
                        <div key={date} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-medium">{usage.requests}</p>
                              <p className="text-muted-foreground">requests</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatNumber(usage.tokens)}</p>
                              <p className="text-muted-foreground">tokens</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatCurrency(usage.cost)}</p>
                              <p className="text-muted-foreground">cost</p>
                            </div>
                          </div>
                        </div>
                      ))}

                    {Object.keys(filteredMetrics.dailyUsage).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No daily usage data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Call History</CardTitle>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {callHistory.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={call.success ? "default" : "destructive"}>
                          {call.success ? "Success" : "Failed"}
                        </Badge>
                        <div>
                          <p className="font-medium">{call.model.split("/")[1]}</p>
                          <p className="text-sm text-muted-foreground">{call.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{call.totalTokens}</p>
                          <p className="text-muted-foreground">tokens</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatTime(call.responseTime)}</p>
                          <p className="text-muted-foreground">response</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatCurrency(call.cost)}</p>
                          <p className="text-muted-foreground">cost</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {callHistory.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No call history available</p>
                      <p className="text-sm">AI calls will appear here when tracking is enabled</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsDashboard
