/**
 * Visual Workflow Builder Component
 * Drag-and-drop interface for creating AI workflows with dependency management
 */

import React, { useState, useCallback, useRef } from "react"
import { useWorkflow, WorkflowStep, workflowTemplates } from "@opencode/ai-hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Play,
  Square,
  Trash2,
  Settings,
  ArrowRight,
  Zap,
  Brain,
  Code,
  Search,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

interface WorkflowBuilderProps {
  onWorkflowSave?: (workflow: { name: string; description: string; steps: WorkflowStep[] }) => void
  initialWorkflow?: { name: string; description: string; steps: WorkflowStep[] }
  className?: string
}

const STEP_TYPES = {
  analyzer: { icon: Search, color: "bg-blue-100 text-blue-800", label: "Analyzer" },
  generator: { icon: Zap, color: "bg-green-100 text-green-800", label: "Generator" },
  reviewer: { icon: CheckCircle, color: "bg-purple-100 text-purple-800", label: "Reviewer" },
  editor: { icon: Edit, color: "bg-orange-100 text-orange-800", label: "Editor" },
  custom: { icon: Brain, color: "bg-gray-100 text-gray-800", label: "Custom" },
}

export function WorkflowBuilder({ onWorkflowSave, initialWorkflow, className = "" }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState(
    initialWorkflow || {
      name: "",
      description: "",
      steps: [] as WorkflowStep[],
    },
  )

  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const { executeWorkflow, getExecution, cancelExecution } = useWorkflow()

  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: "New Step",
      description: "Step description",
      agent: "custom",
      prompt: "Enter your prompt here...",
      dependencies: [],
      outputKey: `output_${Date.now()}`,
    }

    setWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }))
  }, [])

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
    }))
  }, [])

  const deleteStep = useCallback((stepId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }))
  }, [])

  const runWorkflow = useCallback(async () => {
    if (workflow.steps.length === 0) return

    setIsRunning(true)
    try {
      const id = await executeWorkflow({
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps,
        onStepComplete: (stepId, result) => {
          console.log(`Step ${stepId} completed:`, result)
        },
        onWorkflowComplete: (results) => {
          console.log("Workflow completed:", results)
          setIsRunning(false)
        },
        onError: (stepId, error) => {
          console.error(`Step ${stepId} failed:`, error)
        },
      })
      setExecutionId(id)
    } catch (error) {
      console.error("Workflow execution failed:", error)
      setIsRunning(false)
    }
  }, [workflow, executeWorkflow])

  const stopWorkflow = useCallback(() => {
    if (executionId) {
      cancelExecution(executionId)
      setIsRunning(false)
      setExecutionId(null)
    }
  }, [executionId, cancelExecution])

  const loadTemplate = useCallback((templateName: string) => {
    const template = workflowTemplates[templateName as keyof typeof workflowTemplates]
    if (template) {
      setWorkflow({
        name: template.name,
        description: template.description,
        steps: template.steps,
      })
    }
  }, [])

  const execution = executionId ? getExecution(executionId) : null

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Workflow Builder
            </CardTitle>
            <div className="flex gap-2">
              <Select onValueChange={loadTemplate}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Load Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codeReview">Code Review</SelectItem>
                  <SelectItem value="contentCreation">Content Creation</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addStep}>
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflow.name}
                onChange={(e) => setWorkflow((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Input
                id="workflow-description"
                value={workflow.description}
                onChange={(e) => setWorkflow((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workflow description"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Status */}
      {execution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {execution.status === "running" && <Clock className="w-5 h-5 text-blue-500" />}
              {execution.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
              {execution.status === "failed" && <XCircle className="w-5 h-5 text-red-500" />}
              Execution Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress value={execution.progress} className="flex-1" />
              <span className="text-sm font-medium">{execution.progress.toFixed(0)}%</span>
            </div>
            {execution.currentStep && (
              <p className="text-sm text-muted-foreground">
                Current step: {workflow.steps.find((s) => s.id === execution.currentStep)?.name}
              </p>
            )}
            {Object.keys(execution.errors).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">Errors:</p>
                {Object.entries(execution.errors).map(([stepId, error]) => (
                  <p key={stepId} className="text-sm text-red-600">
                    {workflow.steps.find((s) => s.id === stepId)?.name}: {error}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflow.steps.map((step, index) => {
          const stepType = STEP_TYPES[step.agent as keyof typeof STEP_TYPES] || STEP_TYPES.custom
          const Icon = stepType.icon

          return (
            <Card key={step.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">Step {index + 1}</span>
                    </div>
                    <Badge className={stepType.color}>{stepType.label}</Badge>
                    {step.dependencies.length > 0 && (
                      <Badge variant="outline">
                        Depends on:{" "}
                        {step.dependencies.map((dep) => workflow.steps.find((s) => s.id === dep)?.name).join(", ")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Step: {step.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={step.name}
                                onChange={(e) => updateStep(step.id, { name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Agent Type</Label>
                              <Select
                                value={step.agent}
                                onValueChange={(value) => updateStep(step.id, { agent: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STEP_TYPES).map(([key, type]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={step.description}
                              onChange={(e) => updateStep(step.id, { description: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Prompt</Label>
                            <Textarea
                              value={step.prompt}
                              onChange={(e) => updateStep(step.id, { prompt: e.target.value })}
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label>Output Key</Label>
                            <Input
                              value={step.outputKey}
                              onChange={(e) => updateStep(step.id, { outputKey: e.target.value })}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => deleteStep(step.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">{step.name}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {step.prompt.length > 100 ? `${step.prompt.substring(0, 100)}...` : step.prompt}
                  </div>
                </div>
              </CardContent>
              {index < workflow.steps.length - 1 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{workflow.steps.length} steps • Ready to execute</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onWorkflowSave?.(workflow)}
                disabled={!workflow.name || workflow.steps.length === 0}
              >
                Save Workflow
              </Button>
              {!isRunning ? (
                <Button onClick={runWorkflow} disabled={workflow.steps.length === 0}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Workflow
                </Button>
              ) : (
                <Button variant="destructive" onClick={stopWorkflow}>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkflowBuilder
