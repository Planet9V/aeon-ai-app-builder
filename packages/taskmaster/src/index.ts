/**
 * Opencode Taskmaster System
 * Advanced task management and orchestration with SQLite database
 * Designed specifically for Opencode Framework development workflows
 */

import TaskmasterDatabase, {
  Task,
  Project,
  Phase,
  Agent,
  TaskProgress,
  TaskDependency,
  WorkflowExecution,
  getDatabase,
} from "./database"
import { v4 as uuidv4 } from "uuid"
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns"

export interface TaskmasterConfig {
  dbPath?: string
  enableAutoAssignment?: boolean
  enableProgressTracking?: boolean
  enableDependencyManagement?: boolean
  maxConcurrentTasks?: number
}

export interface TaskAssignment {
  taskId: string
  agentId: string
  assignedAt: string
  reason: string
}

export interface ProjectMetrics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageTaskDuration: number
  estimatedCompletionDate?: string
}

export interface AgentMetrics {
  activeTasks: number
  completedTasks: number
  averageTaskDuration: number
  currentWorkload: number
  efficiency: number
  specialization: string[]
}

class OpencodeTaskmaster {
  private db: TaskmasterDatabase
  private config: Required<TaskmasterConfig>

  constructor(config: TaskmasterConfig = {}) {
    this.config = {
      dbPath: config.dbPath || "./taskmaster.db",
      enableAutoAssignment: config.enableAutoAssignment ?? true,
      enableProgressTracking: config.enableProgressTracking ?? true,
      enableDependencyManagement: config.enableDependencyManagement ?? true,
      maxConcurrentTasks: config.maxConcurrentTasks ?? 5,
    }

    this.db = getDatabase(this.config.dbPath)
    this.initializeDefaultAgents()
  }

  private initializeDefaultAgents() {
    // Create default agents for Opencode development
    const defaultAgents = [
      {
        name: "Code Generator",
        role: "development",
        skills: ["typescript", "react", "code-generation", "api-integration"],
        availability: 0.9,
        workload: 0.0,
        active_tasks: [],
      },
      {
        name: "Quality Assurance",
        role: "testing",
        skills: ["testing", "quality-assurance", "bug-detection", "performance-testing"],
        availability: 0.8,
        workload: 0.0,
        active_tasks: [],
      },
      {
        name: "Architecture Designer",
        role: "architecture",
        skills: ["system-design", "scalability", "security", "performance-optimization"],
        availability: 0.7,
        workload: 0.0,
        active_tasks: [],
      },
      {
        name: "Documentation Specialist",
        role: "documentation",
        skills: ["technical-writing", "api-documentation", "user-guides", "tutorials"],
        availability: 0.8,
        workload: 0.0,
        active_tasks: [],
      },
      {
        name: "Deployment Engineer",
        role: "devops",
        skills: ["ci-cd", "docker", "kubernetes", "cloud-deployment", "monitoring"],
        availability: 0.6,
        workload: 0.0,
        active_tasks: [],
      },
    ]

    for (const agentData of defaultAgents) {
      const existing = this.db.listAgents({ name: agentData.name })
      if (existing.length === 0) {
        this.db.createAgent(agentData)
      }
    }
  }

  // Project Management
  async createProject(project: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> {
    return this.db.transaction(() => {
      const createdProject = this.db.createProject(project)

      // Create default phases for Opencode projects
      const defaultPhases = [
        { name: "Planning & Requirements", description: "Define project scope and requirements" },
        { name: "Architecture & Design", description: "Design system architecture and components" },
        { name: "Implementation", description: "Develop core functionality" },
        { name: "Testing & QA", description: "Comprehensive testing and quality assurance" },
        { name: "Deployment & Launch", description: "Production deployment and monitoring" },
      ]

      for (const phase of defaultPhases) {
        this.db.createPhase({
          ...phase,
          project_id: createdProject.id,
          status: "pending",
          progress_percentage: 0,
          dependencies: [],
        })
      }

      return createdProject
    })
  }

  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    const stats = this.db.getProjectStats(projectId)
    const tasks = this.db.listTasks({ project_id: projectId })

    const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0

    // Estimate completion date based on current progress
    let estimatedCompletionDate: string | undefined
    if (stats.completedTasks > 0 && stats.totalTasks > stats.completedTasks) {
      const remainingTasks = stats.totalTasks - stats.completedTasks
      const avgCompletionTime = stats.averageCompletionTime || 24 // hours
      const estimatedHours = remainingTasks * avgCompletionTime
      estimatedCompletionDate = format(addDays(new Date(), estimatedHours / 24), "yyyy-MM-dd")
    }

    return {
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      inProgressTasks: stats.inProgressTasks,
      overdueTasks: stats.overdueTasks,
      completionRate,
      averageTaskDuration: stats.averageCompletionTime,
      estimatedCompletionDate,
    }
  }

  // Task Management
  async createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    return this.db.transaction(() => {
      const createdTask = this.db.createTask(task)

      // Auto-assign if enabled
      if (this.config.enableAutoAssignment && !task.assignee_id) {
        const assignment = this.autoAssignTask(createdTask)
        if (assignment) {
          this.db.updateTask(createdTask.id, { assignee_id: assignment.agentId })
          createdTask.assignee_id = assignment.agentId
        }
      }

      return createdTask
    })
  }

  async updateTaskProgress(
    taskId: string,
    progress: number,
    notes?: string,
    recordedBy: string = "system",
  ): Promise<boolean> {
    if (!this.config.enableProgressTracking) return false

    const task = this.db.getTask(taskId)
    if (!task) return false

    // Record progress
    this.db.recordProgress(taskId, {
      progress_percentage: progress,
      notes,
      recorded_by: recordedBy,
    })

    // Update task status based on progress
    let newStatus = task.status
    if (progress === 100) {
      newStatus = "completed"
    } else if (progress > 0 && task.status === "pending") {
      newStatus = "in_progress"
    }

    // Update task
    const updated = this.db.updateTask(taskId, {
      status: newStatus,
      actual_hours: task.actual_hours || 0, // Would be calculated from time tracking
    })

    // Update agent workload
    if (task.assignee_id) {
      await this.updateAgentWorkload(task.assignee_id)
    }

    return updated
  }

  async addTaskDependency(
    taskId: string,
    dependsOnTaskId: string,
    type: TaskDependency["dependency_type"] = "finish_to_start",
  ): Promise<boolean> {
    if (!this.config.enableDependencyManagement) return false

    const task = this.db.getTask(taskId)
    const dependsOnTask = this.db.getTask(dependsOnTaskId)

    if (!task || !dependsOnTask) return false

    this.db.addDependency({
      task_id: taskId,
      depends_on_task_id: dependsOnTaskId,
      dependency_type: type,
    })

    return true
  }

  async getTaskDependencies(taskId: string): Promise<{
    blocking: Task[]
    blocked: Task[]
  }> {
    const dependencies = this.db.getTaskDependencies(taskId)
    const dependents = this.db.getDependentTasks(taskId)

    const blockingTasks = dependencies
      .map((dep) => {
        const task = this.db.getTask(dep.depends_on_task_id)
        return task
      })
      .filter(Boolean) as Task[]

    const blockedTasks = dependents
      .map((dep) => {
        const task = this.db.getTask(dep.task_id)
        return task
      })
      .filter(Boolean) as Task[]

    return { blocking: blockingTasks, blocked: blockedTasks }
  }

  // Agent Management
  async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    const agent = this.db.getAgent(agentId)
    if (!agent) throw new Error("Agent not found")

    const workload = this.db.getAgentWorkload(agentId)

    return {
      activeTasks: workload.activeTasks,
      completedTasks: workload.completedTasks,
      averageTaskDuration: workload.averageTaskCompletionTime,
      currentWorkload: workload.currentWorkload,
      efficiency: this.calculateAgentEfficiency(agentId),
      specialization: agent.skills,
    }
  }

  private calculateAgentEfficiency(agentId: string): number {
    const workload = this.db.getAgentWorkload(agentId)
    const totalTasks = workload.activeTasks + workload.completedTasks

    if (totalTasks === 0) return 1.0

    // Efficiency based on completion rate and average duration
    const completionRate = workload.completedTasks / totalTasks
    const avgDuration = workload.averageTaskCompletionTime

    // Normalize duration (assuming 24 hours is baseline)
    const durationScore = Math.max(0, 1 - avgDuration / 24)

    return (completionRate + durationScore) / 2
  }

  private async updateAgentWorkload(agentId: string): Promise<void> {
    const activeTasks = this.db.listTasks({
      assignee_id: agentId,
      status: "in_progress",
    }).length

    const maxConcurrent = this.config.maxConcurrentTasks
    const workload = Math.min(activeTasks / maxConcurrent, 1.0)

    this.db.updateAgent(agentId, { workload })
  }

  private autoAssignTask(task: Task): TaskAssignment | null {
    const agents = this.db.listAgents({
      availability_min: 0.3,
      skill: task.tags?.[0], // Match primary tag to skills
    })

    if (agents.length === 0) return null

    // Find best agent based on workload and skills
    let bestAgent = agents[0]
    let bestScore = 0

    for (const agent of agents) {
      const skillMatch = task.tags?.some((tag) => agent.skills.includes(tag)) ? 1 : 0
      const availabilityScore = agent.availability
      const workloadScore = 1 - agent.workload

      const score = skillMatch * 0.5 + availabilityScore * 0.3 + workloadScore * 0.2

      if (score > bestScore) {
        bestScore = score
        bestAgent = agent
      }
    }

    if (bestScore < 0.3) return null // Not good enough match

    return {
      taskId: task.id,
      agentId: bestAgent.id,
      assignedAt: new Date().toISOString(),
      reason: `Auto-assigned based on skills (${bestAgent.skills.join(", ")}) and availability`,
    }
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, context: Record<string, any> = {}): Promise<WorkflowExecution> {
    const execution = this.db.createWorkflowExecution({
      workflow_id: workflowId,
      status: "running",
      started_at: new Date().toISOString(),
      metadata: { context },
    })

    try {
      // Execute workflow steps (simplified - would integrate with actual workflow engine)
      await this.simulateWorkflowExecution(workflowId, execution.id)

      this.db.updateWorkflowExecution(execution.id, {
        status: "completed",
        completed_at: new Date().toISOString(),
      })

      execution.status = "completed"
      execution.completed_at = new Date().toISOString()
    } catch (error) {
      this.db.updateWorkflowExecution(execution.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Workflow execution failed",
      })

      execution.status = "failed"
      execution.error = error instanceof Error ? error.message : "Workflow execution failed"
    }

    return execution
  }

  private async simulateWorkflowExecution(workflowId: string, executionId: string): Promise<void> {
    // Simulate workflow execution with progress updates
    const steps = ["analysis", "design", "implementation", "testing", "deployment"]

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const progress = ((i + 1) / steps.length) * 100

      // Create task for this step
      const task = await this.createTask({
        title: `${step.charAt(0).toUpperCase() + step.slice(1)} Phase`,
        description: `Execute ${step} phase of workflow ${workflowId}`,
        status: "in_progress",
        priority: "high",
        tags: [step, "workflow"],
        metadata: { workflowId, executionId, stepIndex: i },
      })

      // Simulate execution time
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Update progress
      await this.updateTaskProgress(task.id, progress, `Completed ${step} phase`)
    }
  }

  // Analytics & Reporting
  async generateProjectReport(projectId: string): Promise<{
    project: Project
    metrics: ProjectMetrics
    tasks: Task[]
    phases: Phase[]
    recommendations: string[]
  }> {
    const project = this.db.getProject(projectId)
    if (!project) throw new Error("Project not found")

    const metrics = await this.getProjectMetrics(projectId)
    const tasks = this.db.listTasks({ project_id: projectId })
    const phases = this.db.listPhases({ project_id: projectId })

    const recommendations = this.generateRecommendations(metrics, tasks, phases)

    return {
      project,
      metrics,
      tasks,
      phases,
      recommendations,
    }
  }

  private generateRecommendations(metrics: ProjectMetrics, tasks: Task[], phases: Phase[]): string[] {
    const recommendations: string[] = []

    if (metrics.overdueTasks > 0) {
      recommendations.push(`Address ${metrics.overdueTasks} overdue tasks to prevent project delays`)
    }

    if (metrics.completionRate < 50) {
      recommendations.push("Improve task completion rate through better resource allocation")
    }

    const overdueTasks = tasks.filter(
      (task) => task.due_date && isBefore(parseISO(task.due_date), new Date()) && task.status !== "completed",
    )

    if (overdueTasks.length > 0) {
      recommendations.push(`Reassign ${overdueTasks.length} overdue tasks to available agents`)
    }

    const blockedTasks = tasks.filter((task) => task.status === "blocked")
    if (blockedTasks.length > 0) {
      recommendations.push(`Resolve blockers for ${blockedTasks.length} blocked tasks`)
    }

    return recommendations
  }

  // Database maintenance
  async backup(toPath: string): Promise<void> {
    this.db.backup(toPath)
  }

  async optimize(): Promise<void> {
    this.db.optimize()
  }

  // Cleanup
  close(): void {
    this.db.close()
  }
}

// Factory function
export function createTaskmaster(config?: TaskmasterConfig): OpencodeTaskmaster {
  return new OpencodeTaskmaster(config)
}

// Export types and database interface
export type {
  Task,
  Project,
  Phase,
  Agent,
  TaskProgress,
  TaskDependency,
  WorkflowExecution,
  TaskmasterConfig,
  TaskAssignment,
  ProjectMetrics,
  AgentMetrics,
}

export default OpencodeTaskmaster
