/**
 * Deployment Orchestrator Component - Workflow Automation & CI/CD
 * Automated deployment pipelines, environment management, and release orchestration
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
import { Progress } from "@/components/ui/progress"
import {
  Rocket,
  Plus,
  Play,
  Square,
  Settings,
  GitBranch,
  Server,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  GitCommit,
  Cloud,
  Shield,
  Activity,
  AlertTriangle,
  Zap,
} from "lucide-react"

export interface DeploymentPipeline {
  id: string
  name: string
  description: string
  repository: string
  branch: string
  environment: "development" | "staging" | "production"
  stages: PipelineStage[]
  triggers: PipelineTrigger[]
  status: "idle" | "running" | "completed" | "failed" | "paused"
  lastRun?: Date
  metrics: {
    totalRuns: number
    successRate: number
    averageDuration: number
  }
}

export interface PipelineStage {
  id: string
  name: string
  type: "build" | "test" | "deploy" | "rollback" | "notify" | "approval" | "custom"
  config: Record<string, any>
  dependsOn?: string[]
  timeout: number
  retryCount: number
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  logs: string[]
  startTime?: Date
  endTime?: Date
  duration?: number
}

export interface PipelineTrigger {
  type: "push" | "pull_request" | "schedule" | "manual" | "webhook"
  config: Record<string, any>
  enabled: boolean
}

export interface DeploymentRun {
  id: string
  pipelineId: string
  trigger: PipelineTrigger
  status: "running" | "completed" | "failed" | "cancelled"
  stages: PipelineStage[]
  startTime: Date
  endTime?: Date
  duration?: number
  commit?: {
    hash: string
    message: string
    author: string
  }
  artifacts: DeploymentArtifact[]
  logs: string[]
}

export interface DeploymentArtifact {
  name: string
  type: "container" | "package" | "config" | "documentation"
  url: string
  size?: number
  createdAt: Date
}

export interface Environment {
  id: string
  name: string
  type: "development" | "staging" | "production"
  url?: string
  status: "healthy" | "warning" | "critical" | "down"
  lastHealthCheck: Date
  config: Record<string, any>
  deployments: DeploymentRun[]
}

interface DeploymentOrchestratorProps {
  className?: string
  onPipelineCreate?: (pipeline: DeploymentPipeline) => void
  onDeploymentRun?: (run: DeploymentRun) => void
}

export function DeploymentOrchestrator({
  className = "",
  onPipelineCreate,
  onDeploymentRun,
}: DeploymentOrchestratorProps) {
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [runs, setRuns] = useState<DeploymentRun[]>([])
  const [activeTab, setActiveTab] = useState("pipelines")
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Create new deployment pipeline
  const createPipeline = useCallback(
    (pipelineData: Omit<DeploymentPipeline, "id" | "status" | "metrics">) => {
      const pipeline: DeploymentPipeline = {
        id: `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...pipelineData,
        status: "idle",
        metrics: {
          totalRuns: 0,
          successRate: 0,
          averageDuration: 0,
        },
      }
      setPipelines((prev) => [...prev, pipeline])
      onPipelineCreate?.(pipeline)
    },
    [onPipelineCreate],
  )

  // Execute deployment pipeline
  const executePipeline = useCallback(
    async (pipelineId: string, trigger?: PipelineTrigger) => {
      const pipeline = pipelines.find((p) => p.id === pipelineId)
      if (!pipeline) return

      setIsRunning(true)
      const run: DeploymentRun = {
        id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pipelineId,
        trigger: trigger || { type: "manual", config: {}, enabled: true },
        status: "running",
        stages: pipeline.stages.map((stage) => ({ ...stage, status: "pending", logs: [] })),
        startTime: new Date(),
        artifacts: [],
        logs: [`Starting deployment pipeline: ${pipeline.name}`],
      }

      setRuns((prev) => [run, ...prev])

      try {
        // Execute stages sequentially (could be enhanced with parallel execution)
        for (let i = 0; i < run.stages.length; i++) {
          const stage = run.stages[i]

          // Update stage status
          setRuns((prev) =>
            prev.map((r) =>
              r.id === run.id
                ? {
                    ...r,
                    stages: r.stages.map((s) =>
                      s.id === stage.id ? { ...s, status: "running", startTime: new Date() } : s,
                    ),
                  }
                : r,
            ),
          )

          try {
            // Mock stage execution - in production, execute actual deployment steps
            await executeStage(stage)

            // Update stage as completed
            setRuns((prev) =>
              prev.map((r) =>
                r.id === run.id
                  ? {
                      ...r,
                      stages: r.stages.map((s) =>
                        s.id === stage.id
                          ? {
                              ...s,
                              status: "completed",
                              endTime: new Date(),
                              duration: Date.now() - (s.startTime?.getTime() || Date.now()),
                              logs: [...s.logs, `Stage ${stage.name} completed successfully`],
                            }
                          : s,
                      ),
                      logs: [...r.logs, `✅ ${stage.name} completed`],
                    }
                  : r,
              ),
            )
          } catch (error) {
            // Update stage as failed
            setRuns((prev) =>
              prev.map((r) =>
                r.id === run.id
                  ? {
                      ...r,
                      status: "failed",
                      stages: r.stages.map((s) =>
                        s.id === stage.id
                          ? {
                              ...s,
                              status: "failed",
                              endTime: new Date(),
                              duration: Date.now() - (s.startTime?.getTime() || Date.now()),
                              logs: [...s.logs, `❌ Stage failed: ${error}`],
                            }
                          : s,
                      ),
                      logs: [...r.logs, `❌ ${stage.name} failed: ${error}`],
                      endTime: new Date(),
                      duration: Date.now() - r.startTime.getTime(),
                    }
                  : r,
              ),
            )
            break
          }
        }

        // Mark run as completed if all stages succeeded
        const finalRun = runs.find((r) => r.id === run.id)
        if (finalRun && finalRun.stages.every((s) => s.status === "completed")) {
          setRuns((prev) =>
            prev.map((r) =>
              r.id === run.id
                ? {
                    ...r,
                    status: "completed",
                    endTime: new Date(),
                    duration: Date.now() - r.startTime.getTime(),
                    logs: [...r.logs, "🎉 Deployment completed successfully"],
                  }
                : r,
            ),
          )

          // Update pipeline metrics
          setPipelines((prev) =>
            prev.map((p) =>
              p.id === pipelineId
                ? {
                    ...p,
                    lastRun: new Date(),
                    metrics: {
                      totalRuns: p.metrics.totalRuns + 1,
                      successRate: (p.metrics.successRate * p.metrics.totalRuns + 1) / (p.metrics.totalRuns + 1),
                      averageDuration: p.metrics.averageDuration, // Would calculate properly
                    },
                  }
                : p,
            ),
          )
        }

        onDeploymentRun?.(runs.find((r) => r.id === run.id)!)
      } catch (error) {
        setRuns((prev) =>
          prev.map((r) =>
            r.id === run.id
              ? {
                  ...r,
                  status: "failed",
                  endTime: new Date(),
                  duration: Date.now() - r.startTime.getTime(),
                  logs: [...r.logs, `💥 Pipeline failed: ${error}`],
                }
              : r,
          ),
        )
      } finally {
        setIsRunning(false)
      }
    },
    [pipelines, runs, onDeploymentRun],
  )

  // Mock stage execution
  const executeStage = useCallback(async (stage: PipelineStage): Promise<void> => {
    // Simulate different stage types
    switch (stage.type) {
      case "build":
        await new Promise((resolve) => setTimeout(resolve, 2000))
        break
      case "test":
        await new Promise((resolve) => setTimeout(resolve, 1500))
        break
      case "deploy":
        await new Promise((resolve) => setTimeout(resolve, 3000))
        break
      case "notify":
        await new Promise((resolve) => setTimeout(resolve, 500))
        break
      default:
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Random failure for demo (10% chance)
    if (Math.random() < 0.1) {
      throw new Error(`Stage ${stage.name} failed`)
    }
  }, [])

  // Create environment
  const createEnvironment = useCallback(
    (envData: Omit<Environment, "id" | "status" | "lastHealthCheck" | "deployments">) => {
      const environment: Environment = {
        id: `env_${Date.now()}`,
        ...envData,
        status: "healthy",
        lastHealthCheck: new Date(),
        deployments: [],
      }
      setEnvironments((prev) => [...prev, environment])
    },
    [],
  )

  // Get pipeline statistics
  const getPipelineStats = useCallback(
    (pipelineId: string) => {
      const pipelineRuns = runs.filter((r) => r.pipelineId === pipelineId)
      const total = pipelineRuns.length
      const successful = pipelineRuns.filter((r) => r.status === "completed").length
      const avgDuration = total > 0 ? pipelineRuns.reduce((sum, r) => sum + (r.duration || 0), 0) / total : 0

      return { total, successful, avgDuration }
    },
    [runs],
  )

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Rocket className="w-8 h-8 text-primary" />
          Deployment Orchestrator
        </h2>
        <p className="text-lg text-muted-foreground">
          Automated deployment pipelines, environment management, and release orchestration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="runs">Deployment Runs</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Deployment Pipelines</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Deployment Pipeline</DialogTitle>
                </DialogHeader>
                <PipelineForm onSubmit={createPipeline} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelines.map((pipeline) => {
              const stats = getPipelineStats(pipeline.id)
              return (
                <Card key={pipeline.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            pipeline.environment === "production"
                              ? "destructive"
                              : pipeline.environment === "staging"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {pipeline.environment}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => executePipeline(pipeline.id)}
                          disabled={pipeline.status === "running" || isRunning}
                        >
                          {pipeline.status === "running" ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Repository:</span>
                        <span className="font-mono text-xs">{pipeline.repository}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Branch:</span>
                        <span className="font-mono text-xs">{pipeline.branch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stages:</span>
                        <span>{pipeline.stages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span>
                          {stats.total > 0 ? `${Math.round((stats.successful / stats.total) * 100)}%` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Duration:</span>
                        <span>{stats.avgDuration > 0 ? `${Math.round(stats.avgDuration / 1000)}s` : "N/A"}</span>
                      </div>
                      {pipeline.lastRun && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Run:</span>
                          <span className="text-xs">{pipeline.lastRun.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {pipelines.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Rocket className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Deployment Pipelines</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first deployment pipeline to automate your release process
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Pipeline
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Deployment Pipeline</DialogTitle>
                    </DialogHeader>
                    <PipelineForm onSubmit={createPipeline} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Environments</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Environment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Environment</DialogTitle>
                </DialogHeader>
                <EnvironmentForm onSubmit={createEnvironment} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {environments.map((environment) => (
              <Card key={environment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{environment.name}</CardTitle>
                    <Badge
                      variant={
                        environment.status === "healthy"
                          ? "default"
                          : environment.status === "warning"
                            ? "secondary"
                            : environment.status === "critical"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {environment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="capitalize">
                        {environment.type}
                      </Badge>
                    </div>
                    {environment.url && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">URL:</span>
                        <a
                          href={environment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {environment.url}
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deployments:</span>
                      <span>{environment.deployments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Check:</span>
                      <span className="text-xs">{environment.lastHealthCheck.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {runs.map((run) => {
                    const pipeline = pipelines.find((p) => p.id === run.pipelineId)
                    const progress =
                      run.stages.length > 0
                        ? (run.stages.filter((s) => s.status === "completed").length / run.stages.length) * 100
                        : 0

                    return (
                      <Card key={run.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{pipeline?.name || "Unknown Pipeline"}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {run.startTime.toLocaleString()} • {run.trigger.type}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  run.status === "completed"
                                    ? "default"
                                    : run.status === "running"
                                      ? "secondary"
                                      : run.status === "failed"
                                        ? "destructive"
                                        : "outline"
                                }
                              >
                                {run.status}
                              </Badge>
                              {run.duration && (
                                <span className="text-sm text-muted-foreground">
                                  {Math.round(run.duration / 1000)}s
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {run.status === "running" && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} />
                            </div>
                          )}

                          <div className="space-y-2">
                            <h4 className="font-medium">Stages</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {run.stages.map((stage) => (
                                <div key={stage.id} className="flex items-center gap-2 p-2 border rounded">
                                  {stage.status === "completed" ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : stage.status === "running" ? (
                                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                                  ) : stage.status === "failed" ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className="text-sm">{stage.name}</span>
                                  {stage.duration && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {Math.round(stage.duration / 1000)}s
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Artifacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Artifact Management</h3>
                <p>Deployment artifacts will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <GitBranch className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{pipelines.length}</div>
                <div className="text-sm text-muted-foreground">Total Pipelines</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{runs.filter((r) => r.status === "completed").length}</div>
                <div className="text-sm text-muted-foreground">Successful Deployments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {runs.length > 0
                    ? Math.round(runs.reduce((sum, r) => sum + (r.duration || 0), 0) / runs.length / 1000)
                    : 0}
                  s
                </div>
                <div className="text-sm text-muted-foreground">Avg Deployment Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Server className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{environments.length}</div>
                <div className="text-sm text-muted-foreground">Environments</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper Components
function PipelineForm({
  onSubmit,
}: {
  onSubmit: (pipeline: Omit<DeploymentPipeline, "id" | "status" | "metrics">) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repository: "",
    branch: "main",
    environment: "development" as const,
    stages: [] as PipelineStage[],
    triggers: [] as PipelineTrigger[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addStage = () => {
    const newStage: PipelineStage = {
      id: `stage_${Date.now()}`,
      name: "New Stage",
      type: "build",
      config: {},
      timeout: 300000, // 5 minutes
      retryCount: 1,
      status: "pending",
      logs: [],
    }
    setFormData((prev) => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Pipeline Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="environment">Environment</Label>
          <Select
            value={formData.environment}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, environment: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="repository">Repository</Label>
          <Input
            id="repository"
            value={formData.repository}
            onChange={(e) => setFormData((prev) => ({ ...prev, repository: e.target.value }))}
            placeholder="owner/repo"
            required
          />
        </div>
        <div>
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            value={formData.branch}
            onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label>Pipeline Stages</Label>
        <div className="space-y-2">
          {formData.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-2 p-2 border rounded">
              <span className="font-medium">Stage {index + 1}:</span>
              <span>{stage.name}</span>
              <Badge variant="outline">{stage.type}</Badge>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addStage}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stage
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create Pipeline
      </Button>
    </form>
  )
}

function EnvironmentForm({
  onSubmit,
}: {
  onSubmit: (env: Omit<Environment, "id" | "status" | "lastHealthCheck" | "deployments">) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "development" as const,
    url: "",
    config: {},
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Environment Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="url">URL (Optional)</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="https://myapp.com"
        />
      </div>

      <Button type="submit" className="w-full">
        Create Environment
      </Button>
    </form>
  )
}

export default DeploymentOrchestrator
