/**
 * API Gateway Component - Backend Integration & Orchestration
 * Unified interface for API management, authentication, and orchestration
 */

import React, { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Play,
  Square,
  Settings,
  Zap,
  Database,
  Cloud,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Key,
  Globe,
  Server,
} from "lucide-react"

export interface APIEndpoint {
  id: string
  name: string
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers: Record<string, string>
  authentication: {
    type: "none" | "bearer" | "basic" | "api-key" | "oauth"
    credentials?: Record<string, string>
  }
  rateLimit: {
    requests: number
    period: number // seconds
  }
  timeout: number
  retries: number
  enabled: boolean
  tags: string[]
}

export interface APIResponse {
  id: string
  endpointId: string
  timestamp: Date
  status: number
  duration: number
  success: boolean
  data?: any
  error?: string
  headers: Record<string, string>
}

export interface APIOrchestration {
  id: string
  name: string
  description: string
  steps: OrchestrationStep[]
  status: "idle" | "running" | "completed" | "failed"
  results: Record<string, any>
  error?: string
}

export interface OrchestrationStep {
  id: string
  name: string
  type: "api-call" | "transform" | "condition" | "delay" | "parallel"
  config: Record<string, any>
  dependsOn?: string[]
  outputKey?: string
}

interface APIGatewayProps {
  className?: string
  onEndpointCreate?: (endpoint: APIEndpoint) => void
  onOrchestrationRun?: (orchestration: APIOrchestration) => void
}

export function APIGateway({ className = "", onEndpointCreate, onOrchestrationRun }: APIGatewayProps) {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [responses, setResponses] = useState<APIResponse[]>([])
  const [orchestrations, setOrchestrations] = useState<APIOrchestration[]>([])
  const [activeTab, setActiveTab] = useState("endpoints")
  const [isRunning, setIsRunning] = useState(false)

  // Create new API endpoint
  const createEndpoint = useCallback(
    (endpointData: Omit<APIEndpoint, "id">) => {
      const endpoint: APIEndpoint = {
        id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...endpointData,
      }
      setEndpoints((prev) => [...prev, endpoint])
      onEndpointCreate?.(endpoint)
    },
    [onEndpointCreate],
  )

  // Test API endpoint
  const testEndpoint = useCallback(
    async (endpointId: string) => {
      const endpoint = endpoints.find((e) => e.id === endpointId)
      if (!endpoint || !endpoint.enabled) return

      const startTime = Date.now()

      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            ...endpoint.headers,
            ...(endpoint.authentication.type === "bearer" && endpoint.authentication.credentials?.token
              ? { Authorization: `Bearer ${endpoint.authentication.credentials.token}` }
              : {}),
            ...(endpoint.authentication.type === "api-key" && endpoint.authentication.credentials?.key
              ? { [endpoint.authentication.credentials.header || "X-API-Key"]: endpoint.authentication.credentials.key }
              : {}),
          },
          body: ["POST", "PUT", "PATCH"].includes(endpoint.method) ? JSON.stringify({}) : undefined,
        })

        const data = await response.json().catch(() => null)
        const duration = Date.now() - startTime

        const apiResponse: APIResponse = {
          id: `response_${Date.now()}`,
          endpointId,
          timestamp: new Date(),
          status: response.status,
          duration,
          success: response.ok,
          data,
          headers: Object.fromEntries(response.headers.entries()),
        }

        setResponses((prev) => [apiResponse, ...prev.slice(0, 99)]) // Keep last 100 responses
        return apiResponse
      } catch (error) {
        const duration = Date.now() - startTime
        const apiResponse: APIResponse = {
          id: `response_${Date.now()}`,
          endpointId,
          timestamp: new Date(),
          status: 0,
          duration,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }

        setResponses((prev) => [apiResponse, ...prev.slice(0, 99)])
        return apiResponse
      }
    },
    [endpoints],
  )

  // Create API orchestration
  const createOrchestration = useCallback((orchestrationData: Omit<APIOrchestration, "id" | "status" | "results">) => {
    const orchestration: APIOrchestration = {
      id: `orchestration_${Date.now()}`,
      ...orchestrationData,
      status: "idle",
      results: {},
    }
    setOrchestrations((prev) => [...prev, orchestration])
  }, [])

  // Execute API orchestration
  const executeOrchestration = useCallback(
    async (orchestrationId: string) => {
      const orchestration = orchestrations.find((o) => o.id === orchestrationId)
      if (!orchestration) return

      setIsRunning(true)
      setOrchestrations((prev) =>
        prev.map((o) => (o.id === orchestrationId ? { ...o, status: "running", error: undefined } : o)),
      )

      try {
        const results: Record<string, any> = {}

        // Simple sequential execution (could be enhanced with parallel execution)
        for (const step of orchestration.steps) {
          if (step.type === "api-call") {
            const endpoint = endpoints.find((e) => e.id === step.config.endpointId)
            if (endpoint) {
              const response = await testEndpoint(endpoint.id)
              if (response) {
                results[step.outputKey || step.id] = response
              }
            }
          } else if (step.type === "transform") {
            // Apply transformation logic
            const input = results[step.config.inputKey]
            if (input && step.config.transform) {
              results[step.outputKey || step.id] = step.config.transform(input)
            }
          } else if (step.type === "delay") {
            await new Promise((resolve) => setTimeout(resolve, step.config.duration || 1000))
          }
        }

        setOrchestrations((prev) =>
          prev.map((o) => (o.id === orchestrationId ? { ...o, status: "completed", results } : o)),
        )

        onOrchestrationRun?.(orchestrations.find((o) => o.id === orchestrationId)!)
      } catch (error) {
        setOrchestrations((prev) =>
          prev.map((o) =>
            o.id === orchestrationId
              ? {
                  ...o,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Execution failed",
                }
              : o,
          ),
        )
      } finally {
        setIsRunning(false)
      }
    },
    [orchestrations, endpoints, testEndpoint, onOrchestrationRun],
  )

  const getEndpointStats = useCallback(
    (endpointId: string) => {
      const endpointResponses = responses.filter((r) => r.endpointId === endpointId)
      const total = endpointResponses.length
      const success = endpointResponses.filter((r) => r.success).length
      const avgDuration = total > 0 ? endpointResponses.reduce((sum, r) => sum + r.duration, 0) / total : 0

      return { total, success, avgDuration }
    },
    [responses],
  )

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="w-8 h-8 text-primary" />
          API Gateway & Orchestration
        </h2>
        <p className="text-lg text-muted-foreground">Unified API management, orchestration, and backend integration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
          <TabsTrigger value="responses">Response History</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">API Endpoints</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Endpoint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create API Endpoint</DialogTitle>
                </DialogHeader>
                <EndpointForm onSubmit={createEndpoint} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpoints.map((endpoint) => {
              const stats = getEndpointStats(endpoint.id)
              return (
                <Card key={endpoint.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={endpoint.enabled ? "default" : "secondary"}>
                          {endpoint.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => testEndpoint(endpoint.id)}>
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <Badge variant="outline">{endpoint.method}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">URL:</span>
                        <span className="font-mono text-xs truncate">{endpoint.url}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Auth:</span>
                        <span className="capitalize">{endpoint.authentication.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span>{stats.total > 0 ? `${Math.round((stats.success / stats.total) * 100)}%` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Response:</span>
                        <span>{stats.avgDuration > 0 ? `${Math.round(stats.avgDuration)}ms` : "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {endpoints.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Server className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No API Endpoints</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first API endpoint to start integrating with external services
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Endpoint
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create API Endpoint</DialogTitle>
                    </DialogHeader>
                    <EndpointForm onSubmit={createEndpoint} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">API Orchestrations</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Orchestration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create API Orchestration</DialogTitle>
                </DialogHeader>
                <OrchestrationForm endpoints={endpoints} onSubmit={createOrchestration} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {orchestrations.map((orchestration) => (
              <Card key={orchestration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{orchestration.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          orchestration.status === "completed"
                            ? "default"
                            : orchestration.status === "running"
                              ? "secondary"
                              : orchestration.status === "failed"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {orchestration.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeOrchestration(orchestration.id)}
                        disabled={orchestration.status === "running" || isRunning}
                      >
                        {orchestration.status === "running" ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{orchestration.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Steps:</span> {orchestration.steps.length}
                    </div>
                    {orchestration.error && (
                      <div className="text-sm text-red-600">
                        <span className="font-medium">Error:</span> {orchestration.error}
                      </div>
                    )}
                    {Object.keys(orchestration.results).length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Results:</span> {Object.keys(orchestration.results).length}{" "}
                        outputs
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Response History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {responses.map((response) => {
                    const endpoint = endpoints.find((e) => e.id === response.endpointId)
                    return (
                      <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {response.success ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{endpoint?.name || "Unknown Endpoint"}</p>
                            <p className="text-sm text-muted-foreground">
                              {response.timestamp.toLocaleString()} • {response.duration}ms
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <Badge variant={response.success ? "default" : "destructive"}>
                            {response.status || "Error"}
                          </Badge>
                          <span className="text-muted-foreground">{response.duration}ms</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Server className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{endpoints.length}</div>
                <div className="text-sm text-muted-foreground">Total Endpoints</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{responses.filter((r) => r.success).length}</div>
                <div className="text-sm text-muted-foreground">Successful Calls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {responses.length > 0
                    ? Math.round(responses.reduce((sum, r) => sum + r.duration, 0) / responses.length)
                    : 0}
                  ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{orchestrations.length}</div>
                <div className="text-sm text-muted-foreground">Orchestrations</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper Components
function EndpointForm({ onSubmit }: { onSubmit: (endpoint: Omit<APIEndpoint, "id">) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET" as const,
    headers: {},
    authentication: { type: "none" as const },
    rateLimit: { requests: 100, period: 60 },
    timeout: 30000,
    retries: 3,
    enabled: true,
    tags: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="method">Method</Label>
          <Select
            value={formData.method}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="https://api.example.com/endpoint"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enabled: checked }))}
        />
        <Label htmlFor="enabled">Enabled</Label>
      </div>

      <Button type="submit" className="w-full">
        Create Endpoint
      </Button>
    </form>
  )
}

function OrchestrationForm({
  endpoints,
  onSubmit,
}: {
  endpoints: APIEndpoint[]
  onSubmit: (orchestration: Omit<APIOrchestration, "id" | "status" | "results">) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    steps: [] as OrchestrationStep[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addStep = () => {
    const newStep: OrchestrationStep = {
      id: `step_${Date.now()}`,
      name: "New Step",
      type: "api-call",
      config: {},
      outputKey: `output_${Date.now()}`,
    }
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label>Steps</Label>
        <div className="space-y-2">
          {formData.steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 p-2 border rounded">
              <span className="font-medium">Step {index + 1}:</span>
              <span>{step.name}</span>
              <Badge variant="outline">{step.type}</Badge>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addStep}>
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Orchestration
      </Button>
    </form>
  )
}

export default APIGateway
