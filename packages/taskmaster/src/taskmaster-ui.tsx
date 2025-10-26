/**
 * Opencode Taskmaster UI Components
 * React components for task management and project orchestration
 */

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Play,
  Square,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Zap,
  GitBranch,
  Database,
} from "lucide-react"
import OpencodeTaskmaster, { Task, Project, Phase, Agent, ProjectMetrics, AgentMetrics } from "./index"

interface TaskmasterDashboardProps {
  taskmaster: OpencodeTaskmaster
  className?: string
}

export function TaskmasterDashboard({ taskmaster, className = "" }: TaskmasterDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    try {
      // Load projects and agents
      const projectList = await taskmaster.db.listProjects()
      const agentList = await taskmaster.db.listAgents()

      setProjects(projectList)
      setAgents(agentList)

      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0].id)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [taskmaster, selectedProject])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          Opencode Taskmaster
        </h2>
        <p className="text-lg text-muted-foreground">
          Advanced project orchestration and task management for Opencode development
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            projects={projects}
            agents={agents}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            taskmaster={taskmaster}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTab
            projects={projects}
            onProjectCreate={(project) => {
              setProjects((prev) => [...prev, project])
            }}
            taskmaster={taskmaster}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab selectedProject={selectedProject} taskmaster={taskmaster} />
        </TabsContent>

        <TabsContent value="agents">
          <AgentsTab agents={agents} taskmaster={taskmaster} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab projects={projects} agents={agents} taskmaster={taskmaster} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({
  projects,
  agents,
  selectedProject,
  onProjectSelect,
  taskmaster,
}: {
  projects: Project[]
  agents: Agent[]
  selectedProject: string | null
  onProjectSelect: (projectId: string) => void
  taskmaster: OpencodeTaskmaster
}) {
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(null)

  useEffect(() => {
    if (selectedProject) {
      taskmaster.getProjectMetrics(selectedProject).then(setProjectMetrics)
    }
  }, [selectedProject, taskmaster])

  const totalTasks = projects.reduce((sum, p) => sum + taskmaster.db.getProjectStats(p.id).totalTasks, 0)
  const completedTasks = projects.reduce((sum, p) => sum + taskmaster.db.getProjectStats(p.id).completedTasks, 0)
  const activeAgents = agents.filter((a) => a.workload > 0).length

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <GitBranch className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Active Projects</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {activeAgents}/{agents.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Agents</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Selector and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-select">Select Project</Label>
                <Select value={selectedProject || ""} onValueChange={onProjectSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProject && projectMetrics && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-medium">{Math.round(projectMetrics.completionRate)}%</span>
                  </div>
                  <Progress value={projectMetrics.completionRate} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Tasks</div>
                      <div className="font-medium">{projectMetrics.totalTasks}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Duration</div>
                      <div className="font-medium">{Math.round(projectMetrics.averageTaskDuration)}h</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {projects.slice(0, 3).map((project) => {
                const stats = taskmaster.db.getProjectStats(project.id)
                return (
                  <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {stats.completedTasks}/{stats.totalTasks} tasks completed
                      </div>
                    </div>
                    <Badge variant={stats.completedTasks === stats.totalTasks ? "default" : "secondary"}>
                      {stats.completedTasks === stats.totalTasks ? "Complete" : "In Progress"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Projects Tab Component
function ProjectsTab({
  projects,
  onProjectCreate,
  taskmaster,
}: {
  projects: Project[]
  onProjectCreate: (project: Project) => void
  taskmaster: OpencodeTaskmaster
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateProject = async (projectData: Omit<Project, "id" | "created_at" | "updated_at">) => {
    try {
      const project = await taskmaster.createProject(projectData)
      onProjectCreate(project)
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Projects</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={handleCreateProject} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const stats = taskmaster.db.getProjectStats(project.id)
          const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0

          return (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge
                    variant={
                      project.status === "completed" ? "default" : project.status === "active" ? "secondary" : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{project.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Tasks</div>
                      <div className="font-medium">
                        {stats.completedTasks}/{stats.totalTasks}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Team</div>
                      <div className="font-medium">{project.team_members.length} members</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Tasks Tab Component
function TasksTab({ selectedProject, taskmaster }: { selectedProject: string | null; taskmaster: OpencodeTaskmaster }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    if (selectedProject) {
      const projectTasks = taskmaster.db.listTasks({ project_id: selectedProject })
      setTasks(projectTasks)
    }
  }, [selectedProject, taskmaster])

  const handleCreateTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    try {
      const task = await taskmaster.createTask({
        ...taskData,
        project_id: selectedProject!,
      })
      setTasks((prev) => [...prev, task])
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleUpdateProgress = async (taskId: string, progress: number) => {
    try {
      await taskmaster.updateTaskProgress(taskId, progress)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: progress === 100 ? "completed" : "in_progress" } : task,
        ),
      )
    } catch (error) {
      console.error("Failed to update progress:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Tasks</h3>
        {selectedProject && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={handleCreateTask} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedProject ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
            <p className="text-muted-foreground">Select a project to view and manage tasks</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{task.priority}</Badge>
                      <Badge
                        variant={
                          task.status === "completed"
                            ? "default"
                            : task.status === "in_progress"
                              ? "secondary"
                              : task.status === "blocked"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== "completed" && (
                      <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(task.id, 100)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{task.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Assignee</div>
                      <div className="font-medium">{task.assignee_id || "Unassigned"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Due Date</div>
                      <div className="font-medium">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Est. Hours</div>
                      <div className="font-medium">{task.estimated_hours || "Not set"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Tags</div>
                      <div className="flex gap-1">
                        {task.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        )) || "None"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Tasks Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first task to get started</p>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <TaskForm onSubmit={handleCreateTask} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Agents Tab Component
function AgentsTab({ agents, taskmaster }: { agents: Agent[]; taskmaster: OpencodeTaskmaster }) {
  const [agentMetrics, setAgentMetrics] = useState<Record<string, AgentMetrics>>({})

  useEffect(() => {
    const loadMetrics = async () => {
      const metrics: Record<string, AgentMetrics> = {}
      for (const agent of agents) {
        try {
          metrics[agent.id] = await taskmaster.getAgentMetrics(agent.id)
        } catch (error) {
          console.error(`Failed to load metrics for agent ${agent.id}:`, error)
        }
      }
      setAgentMetrics(metrics)
    }

    if (agents.length > 0) {
      loadMetrics()
    }
  }, [agents, taskmaster])

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">AI Agents</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const metrics = agentMetrics[agent.id]
          const workloadPercentage = Math.round(agent.workload * 100)

          return (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <Badge variant="outline">{agent.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Workload</span>
                      <span>{workloadPercentage}%</span>
                    </div>
                    <Progress value={workloadPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Availability</div>
                      <div className="font-medium">{Math.round(agent.availability * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Active Tasks</div>
                      <div className="font-medium">{agent.active_tasks.length}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-sm mb-1">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {metrics && (
                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <div className="text-muted-foreground">Efficiency</div>
                        <div className="font-medium">{Math.round(metrics.efficiency * 100)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Analytics Tab Component
function AnalyticsTab({
  projects,
  agents,
  taskmaster,
}: {
  projects: Project[]
  agents: Agent[]
  taskmaster: OpencodeTaskmaster
}) {
  const [projectMetrics, setProjectMetrics] = useState<Record<string, ProjectMetrics>>({})

  useEffect(() => {
    const loadMetrics = async () => {
      const metrics: Record<string, ProjectMetrics> = {}
      for (const project of projects) {
        try {
          metrics[project.id] = await taskmaster.getProjectMetrics(project.id)
        } catch (error) {
          console.error(`Failed to load metrics for project ${project.id}:`, error)
        }
      }
      setProjectMetrics(metrics)
    }

    if (projects.length > 0) {
      loadMetrics()
    }
  }, [projects, taskmaster])

  const totalTasks = Object.values(projectMetrics).reduce((sum, m) => sum + m.totalTasks, 0)
  const completedTasks = Object.values(projectMetrics).reduce((sum, m) => sum + m.completedTasks, 0)
  const overallCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Analytics Dashboard</h3>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{Math.round(overallCompletionRate)}%</div>
            <div className="text-sm text-muted-foreground">Overall Completion</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{completedTasks}</div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{agents.length}</div>
            <div className="text-sm text-muted-foreground">Active Agents</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Total Projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Project Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Avg Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const metrics = projectMetrics[project.id]
                if (!metrics) return null

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "default"
                            : project.status === "active"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={metrics.completionRate} className="w-16 h-2" />
                        <span className="text-sm">{Math.round(metrics.completionRate)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {metrics.completedTasks}/{metrics.totalTasks}
                    </TableCell>
                    <TableCell>{Math.round(metrics.averageTaskDuration)}h</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Form Components
function ProjectForm({ onSubmit }: { onSubmit: (project: Omit<Project, "id" | "created_at" | "updated_at">) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as const,
    team_members: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Project Name</Label>
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
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Create Project
      </Button>
    </form>
  )
}

function TaskForm({ onSubmit }: { onSubmit: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    estimated_hours: undefined as number | undefined,
    due_date: "",
    tags: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      due_date: formData.due_date || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="estimated_hours">Estimated Hours</Label>
          <Input
            id="estimated_hours"
            type="number"
            value={formData.estimated_hours || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                estimated_hours: e.target.value ? parseInt(e.target.value) : undefined,
              }))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
        />
      </div>

      <Button type="submit" className="w-full">
        Create Task
      </Button>
    </form>
  )
}

export default TaskmasterDashboard
