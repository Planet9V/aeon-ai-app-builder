/**
 * SQLite Database Layer for Taskmaster System
 * Handles all database operations for task management, progress tracking, and orchestration
 */

import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"
import { format, parseISO, isAfter, isBefore } from "date-fns"

export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  assignee_id?: string
  project_id?: string
  phase_id?: string
  parent_task_id?: string
  estimated_hours?: number
  actual_hours?: number
  due_date?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  start_date?: string
  end_date?: string
  budget?: number
  team_members: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Phase {
  id: string
  name: string
  description?: string
  project_id: string
  status: "pending" | "active" | "completed"
  start_date?: string
  end_date?: string
  progress_percentage: number
  dependencies: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TaskProgress {
  id: string
  task_id: string
  progress_percentage: number
  notes?: string
  recorded_by: string
  recorded_at: string
}

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
  dependency_type: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish"
  lag_days?: number
  created_at: string
}

export interface Agent {
  id: string
  name: string
  role: string
  skills: string[]
  availability: number // 0-1 scale
  workload: number // 0-1 scale
  active_tasks: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: "pending" | "running" | "completed" | "failed"
  started_at?: string
  completed_at?: string
  results?: Record<string, any>
  error?: string
  metadata?: Record<string, any>
}

class TaskmasterDatabase {
  private db: Database.Database
  private dbPath: string

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), "taskmaster.db")
    this.ensureDirectoryExists()
    this.db = new Database(this.dbPath)
    this.initializeSchema()
  }

  private ensureDirectoryExists() {
    const dir = path.dirname(this.dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  private initializeSchema() {
    // Enable foreign keys
    this.db.pragma("foreign_keys = ON")

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'planning',
        start_date TEXT,
        end_date TEXT,
        budget REAL,
        team_members TEXT, -- JSON array
        metadata TEXT, -- JSON
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Phases table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS phases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        project_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        start_date TEXT,
        end_date TEXT,
        progress_percentage REAL DEFAULT 0,
        dependencies TEXT, -- JSON array
        metadata TEXT, -- JSON
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    // Agents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        skills TEXT, -- JSON array
        availability REAL DEFAULT 1.0,
        workload REAL DEFAULT 0.0,
        active_tasks TEXT, -- JSON array
        metadata TEXT, -- JSON
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        assignee_id TEXT,
        project_id TEXT,
        phase_id TEXT,
        parent_task_id TEXT,
        estimated_hours REAL,
        actual_hours REAL,
        due_date TEXT,
        tags TEXT, -- JSON array
        metadata TEXT, -- JSON
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignee_id) REFERENCES agents(id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `)

    // Task dependencies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        depends_on_task_id TEXT NOT NULL,
        dependency_type TEXT DEFAULT 'finish_to_start',
        lag_days INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `)

    // Task progress table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_progress (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        progress_percentage REAL DEFAULT 0,
        notes TEXT,
        recorded_by TEXT NOT NULL,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `)

    // Workflow executions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        started_at TEXT,
        completed_at TEXT,
        results TEXT, -- JSON
        error TEXT,
        metadata TEXT, -- JSON
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_task_progress_task ON task_progress(task_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_phases_project ON phases(project_id);
      CREATE INDEX IF NOT EXISTS idx_agents_availability ON agents(availability);
    `)
  }

  // Project operations
  createProject(project: Omit<Project, "id" | "created_at" | "updated_at">): Project {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, status, start_date, end_date, budget, team_members, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      project.name,
      project.description,
      project.status,
      project.start_date,
      project.end_date,
      project.budget,
      JSON.stringify(project.team_members || []),
      JSON.stringify(project.metadata || {}),
      now,
      now,
    )

    return { ...project, id, created_at: now, updated_at: now }
  }

  getProject(id: string): Project | null {
    const stmt = this.db.prepare("SELECT * FROM projects WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      team_members: JSON.parse(row.team_members || "[]"),
      metadata: JSON.parse(row.metadata || "{}"),
    }
  }

  updateProject(id: string, updates: Partial<Project>): boolean {
    const fields = Object.keys(updates).filter((key) => key !== "id" && key !== "created_at")
    if (fields.length === 0) return false

    const setClause = fields.map((field) => `${field} = ?`).join(", ")
    const values = fields.map((field) => {
      const value = updates[field as keyof Project]
      if (Array.isArray(value) || typeof value === "object") {
        return JSON.stringify(value)
      }
      return value
    })

    values.push(new Date().toISOString(), id)

    const stmt = this.db.prepare(`UPDATE projects SET ${setClause}, updated_at = ? WHERE id = ?`)
    const result = stmt.run(...values)

    return result.changes > 0
  }

  deleteProject(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM projects WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  listProjects(filters?: { status?: string; team_member?: string }): Project[] {
    let query = "SELECT * FROM projects"
    const params: any[] = []

    if (filters?.status) {
      query += " WHERE status = ?"
      params.push(filters.status)
    }

    if (filters?.team_member) {
      const condition = filters.status ? " AND " : " WHERE "
      query += `${condition}team_members LIKE ?`
      params.push(`%${filters.team_member}%`)
    }

    query += " ORDER BY created_at DESC"

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]

    return rows.map((row) => ({
      ...row,
      team_members: JSON.parse(row.team_members || "[]"),
      metadata: JSON.parse(row.metadata || "{}"),
    }))
  }

  // Task operations
  createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Task {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, assignee_id, project_id, phase_id, parent_task_id, estimated_hours, actual_hours, due_date, tags, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.assignee_id,
      task.project_id,
      task.phase_id,
      task.parent_task_id,
      task.estimated_hours,
      task.actual_hours,
      task.due_date,
      JSON.stringify(task.tags || []),
      JSON.stringify(task.metadata || {}),
      now,
      now,
    )

    return { ...task, id, created_at: now, updated_at: now }
  }

  getTask(id: string): Task | null {
    const stmt = this.db.prepare("SELECT * FROM tasks WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      tags: JSON.parse(row.tags || "[]"),
      metadata: JSON.parse(row.metadata || "{}"),
    }
  }

  updateTask(id: string, updates: Partial<Task>): boolean {
    const fields = Object.keys(updates).filter((key) => key !== "id" && key !== "created_at")
    if (fields.length === 0) return false

    const setClause = fields.map((field) => `${field} = ?`).join(", ")
    const values = fields.map((field) => {
      const value = updates[field as keyof Task]
      if (Array.isArray(value) || typeof value === "object") {
        return JSON.stringify(value)
      }
      return value
    })

    values.push(new Date().toISOString(), id)

    const stmt = this.db.prepare(`UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ?`)
    const result = stmt.run(...values)

    return result.changes > 0
  }

  deleteTask(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM tasks WHERE id = ?")
    const result = stmt.run(id)
    return result.changes > 0
  }

  listTasks(filters?: {
    status?: string
    assignee_id?: string
    project_id?: string
    phase_id?: string
    priority?: string
    due_before?: string
    due_after?: string
  }): Task[] {
    let query = "SELECT * FROM tasks"
    const params: any[] = []
    const conditions: string[] = []

    if (filters?.status) {
      conditions.push("status = ?")
      params.push(filters.status)
    }

    if (filters?.assignee_id) {
      conditions.push("assignee_id = ?")
      params.push(filters.assignee_id)
    }

    if (filters?.project_id) {
      conditions.push("project_id = ?")
      params.push(filters.project_id)
    }

    if (filters?.phase_id) {
      conditions.push("phase_id = ?")
      params.push(filters.phase_id)
    }

    if (filters?.priority) {
      conditions.push("priority = ?")
      params.push(filters.priority)
    }

    if (filters?.due_before) {
      conditions.push("due_date <= ?")
      params.push(filters.due_before)
    }

    if (filters?.due_after) {
      conditions.push("due_date >= ?")
      params.push(filters.due_after)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY priority DESC, due_date ASC, created_at DESC"

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]

    return rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags || "[]"),
      metadata: JSON.parse(row.metadata || "{}"),
    }))
  }

  // Task progress operations
  recordProgress(taskId: string, progress: Omit<TaskProgress, "id" | "task_id" | "recorded_at">): TaskProgress {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO task_progress (id, task_id, progress_percentage, notes, recorded_by, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, taskId, progress.progress_percentage, progress.notes, progress.recorded_by, now)

    return { ...progress, id, task_id: taskId, recorded_at: now }
  }

  getTaskProgress(taskId: string): TaskProgress[] {
    const stmt = this.db.prepare("SELECT * FROM task_progress WHERE task_id = ? ORDER BY recorded_at DESC")
    const rows = stmt.all(taskId) as any[]
    return rows
  }

  // Task dependency operations
  addDependency(dependency: Omit<TaskDependency, "id" | "created_at">): TaskDependency {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO task_dependencies (id, task_id, depends_on_task_id, dependency_type, lag_days, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      dependency.task_id,
      dependency.depends_on_task_id,
      dependency.dependency_type,
      dependency.lag_days || 0,
      now,
    )

    return { ...dependency, id, created_at: now }
  }

  getTaskDependencies(taskId: string): TaskDependency[] {
    const stmt = this.db.prepare("SELECT * FROM task_dependencies WHERE task_id = ?")
    return stmt.all(taskId) as TaskDependency[]
  }

  getDependentTasks(taskId: string): TaskDependency[] {
    const stmt = this.db.prepare("SELECT * FROM task_dependencies WHERE depends_on_task_id = ?")
    return stmt.all(taskId) as TaskDependency[]
  }

  // Agent operations
  createAgent(agent: Omit<Agent, "id" | "created_at" | "updated_at">): Agent {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO agents (id, name, role, skills, availability, workload, active_tasks, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      agent.name,
      agent.role,
      JSON.stringify(agent.skills || []),
      agent.availability,
      agent.workload,
      JSON.stringify(agent.active_tasks || []),
      JSON.stringify(agent.metadata || {}),
      now,
      now,
    )

    return { ...agent, id, created_at: now, updated_at: now }
  }

  getAgent(id: string): Agent | null {
    const stmt = this.db.prepare("SELECT * FROM agents WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      skills: JSON.parse(row.skills || "[]"),
      active_tasks: JSON.parse(row.active_tasks || "[]"),
      metadata: JSON.parse(row.metadata || "{}"),
    }
  }

  updateAgent(id: string, updates: Partial<Agent>): boolean {
    const fields = Object.keys(updates).filter((key) => key !== "id" && key !== "created_at")
    if (fields.length === 0) return false

    const setClause = fields.map((field) => `${field} = ?`).join(", ")
    const values = fields.map((field) => {
      const value = updates[field as keyof Agent]
      if (Array.isArray(value) || typeof value === "object") {
        return JSON.stringify(value)
      }
      return value
    })

    values.push(new Date().toISOString(), id)

    const stmt = this.db.prepare(`UPDATE agents SET ${setClause}, updated_at = ? WHERE id = ?`)
    const result = stmt.run(...values)

    return result.changes > 0
  }

  listAgents(filters?: { role?: string; skill?: string; availability_min?: number }): Agent[] {
    let query = "SELECT * FROM agents"
    const params: any[] = []
    const conditions: string[] = []

    if (filters?.role) {
      conditions.push("role = ?")
      params.push(filters.role)
    }

    if (filters?.skill) {
      conditions.push("skills LIKE ?")
      params.push(`%${filters.skill}%`)
    }

    if (filters?.availability_min !== undefined) {
      conditions.push("availability >= ?")
      params.push(filters.availability_min)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY availability DESC, workload ASC"

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]

    return rows.map((row) => ({
      ...row,
      skills: JSON.parse(row.skills || "[]"),
      active_tasks: JSON.parse(row.active_tasks || "[]"),
      metadata: JSON.parse(row.metadata || "{}"),
    }))
  }

  // Workflow execution operations
  createWorkflowExecution(execution: Omit<WorkflowExecution, "id" | "created_at">): WorkflowExecution {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO workflow_executions (id, workflow_id, status, started_at, completed_at, results, error, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      execution.workflow_id,
      execution.status,
      execution.started_at,
      execution.completed_at,
      JSON.stringify(execution.results || {}),
      execution.error,
      JSON.stringify(execution.metadata || {}),
      now,
    )

    return { ...execution, id }
  }

  updateWorkflowExecution(id: string, updates: Partial<WorkflowExecution>): boolean {
    const fields = Object.keys(updates).filter((key) => key !== "id" && key !== "created_at")
    if (fields.length === 0) return false

    const setClause = fields.map((field) => `${field} = ?`).join(", ")
    const values = fields.map((field) => {
      const value = updates[field as keyof WorkflowExecution]
      if (typeof value === "object") {
        return JSON.stringify(value)
      }
      return value
    })

    values.push(id)

    const stmt = this.db.prepare(`UPDATE workflow_executions SET ${setClause} WHERE id = ?`)
    const result = stmt.run(...values)

    return result.changes > 0
  }

  getWorkflowExecution(id: string): WorkflowExecution | null {
    const stmt = this.db.prepare("SELECT * FROM workflow_executions WHERE id = ?")
    const row = stmt.get(id) as any

    if (!row) return null

    return {
      ...row,
      results: JSON.parse(row.results || "{}"),
      metadata: JSON.parse(row.metadata || "{}"),
    }
  }

  // Analytics and reporting
  getProjectStats(projectId: string): {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    overdueTasks: number
    averageCompletionTime: number
  } {
    const taskStats = this.db
      .prepare(
        `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' AND due_date < updated_at THEN 1 ELSE 0 END) as overdue
      FROM tasks
      WHERE project_id = ?
    `,
      )
      .get(projectId) as any

    const avgCompletionTime = this.db
      .prepare(
        `
      SELECT AVG(julianday(updated_at) - julianday(created_at)) * 24 as avg_hours
      FROM tasks
      WHERE project_id = ? AND status = 'completed'
    `,
      )
      .get(projectId) as any

    return {
      totalTasks: taskStats.total || 0,
      completedTasks: taskStats.completed || 0,
      inProgressTasks: taskStats.in_progress || 0,
      overdueTasks: taskStats.overdue || 0,
      averageCompletionTime: avgCompletionTime?.avg_hours || 0,
    }
  }

  getAgentWorkload(agentId: string): {
    activeTasks: number
    completedTasks: number
    averageTaskCompletionTime: number
    currentWorkload: number
  } {
    const workloadStats = this.db
      .prepare(
        `
      SELECT
        COUNT(CASE WHEN status IN ('pending', 'in_progress') THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM tasks
      WHERE assignee_id = ?
    `,
      )
      .get(agentId) as any

    const avgCompletionTime = this.db
      .prepare(
        `
      SELECT AVG(julianday(updated_at) - julianday(created_at)) * 24 as avg_hours
      FROM tasks
      WHERE assignee_id = ? AND status = 'completed'
    `,
      )
      .get(agentId) as any

    const agent = this.getAgent(agentId)

    return {
      activeTasks: workloadStats.active || 0,
      completedTasks: workloadStats.completed || 0,
      averageTaskCompletionTime: avgCompletionTime?.avg_hours || 0,
      currentWorkload: agent?.workload || 0,
    }
  }

  // Database maintenance
  backup(toPath: string): void {
    this.db.backup(toPath)
  }

  optimize(): void {
    this.db.exec("VACUUM")
    this.db.exec("ANALYZE")
  }

  close(): void {
    this.db.close()
  }

  // Transaction support
  transaction<T>(callback: () => T): T {
    const transaction = this.db.transaction(callback)
    return transaction()
  }
}

// Singleton instance
let dbInstance: TaskmasterDatabase | null = null

export function getDatabase(dbPath?: string): TaskmasterDatabase {
  if (!dbInstance) {
    dbInstance = new TaskmasterDatabase(dbPath)
  }
  return dbInstance
}

export default TaskmasterDatabase
