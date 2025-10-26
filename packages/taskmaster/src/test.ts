/**
 * Taskmaster Testing Suite
 * Comprehensive tests for SQLite database operations and task management
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { createTaskmaster } from "./index"
import fs from "fs"
import path from "path"

describe("Opencode Taskmaster", () => {
  let taskmaster: ReturnType<typeof createTaskmaster>
  const testDbPath = "./test-taskmaster.db"

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }

    taskmaster = createTaskmaster({
      dbPath: testDbPath,
      enableAutoAssignment: false,
      enableProgressTracking: true,
      enableDependencyManagement: true,
    })
  })

  afterEach(() => {
    // Clean up test database
    taskmaster.close()
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
  })

  describe("Project Management", () => {
    it("should create and retrieve a project", async () => {
      const projectData = {
        name: "Test Project",
        description: "A test project for Taskmaster",
        status: "active" as const,
        team_members: ["alice", "bob"],
      }

      const project = await taskmaster.createProject(projectData)
      expect(project.id).toBeDefined()
      expect(project.name).toBe(projectData.name)
      expect(project.team_members).toEqual(projectData.team_members)

      const retrieved = taskmaster.db.getProject(project.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe(projectData.name)
    })

    it("should list projects with filters", async () => {
      await taskmaster.createProject({
        name: "Active Project",
        status: "active",
        team_members: ["alice"],
      })

      await taskmaster.createProject({
        name: "Planning Project",
        status: "planning",
        team_members: ["bob"],
      })

      const activeProjects = taskmaster.db.listProjects({ status: "active" })
      expect(activeProjects.length).toBe(1)
      expect(activeProjects[0].name).toBe("Active Project")
    })

    it("should update project information", async () => {
      const project = await taskmaster.createProject({
        name: "Original Name",
        status: "planning",
        team_members: ["alice"],
      })

      const updated = taskmaster.db.updateProject(project.id, {
        name: "Updated Name",
        status: "active",
      })

      expect(updated).toBe(true)

      const retrieved = taskmaster.db.getProject(project.id)
      expect(retrieved?.name).toBe("Updated Name")
      expect(retrieved?.status).toBe("active")
    })
  })

  describe("Task Management", () => {
    let projectId: string

    beforeEach(async () => {
      const project = await taskmaster.createProject({
        name: "Test Project",
        status: "active",
        team_members: ["alice", "bob"],
      })
      projectId = project.id
    })

    it("should create and retrieve tasks", async () => {
      const taskData = {
        title: "Test Task",
        description: "A test task",
        priority: "high" as const,
        project_id: projectId,
        estimated_hours: 8,
        tags: ["test", "development"],
      }

      const task = await taskmaster.createTask(taskData)
      expect(task.id).toBeDefined()
      expect(task.title).toBe(taskData.title)
      expect(task.tags).toEqual(taskData.tags)

      const retrieved = taskmaster.db.getTask(task.id)
      expect(retrieved?.title).toBe(taskData.title)
    })

    it("should update task progress", async () => {
      const task = await taskmaster.createTask({
        title: "Progress Test Task",
        project_id: projectId,
      })

      await taskmaster.updateTaskProgress(task.id, 50, "Halfway complete")

      const updated = taskmaster.db.getTask(task.id)
      expect(updated?.status).toBe("in_progress")

      const progress = taskmaster.db.getTaskProgress(task.id)
      expect(progress.length).toBe(1)
      expect(progress[0].progress_percentage).toBe(50)
      expect(progress[0].notes).toBe("Halfway complete")
    })

    it("should complete tasks automatically at 100%", async () => {
      const task = await taskmaster.createTask({
        title: "Completion Test Task",
        project_id: projectId,
      })

      await taskmaster.updateTaskProgress(task.id, 100, "Task completed")

      const updated = taskmaster.db.getTask(task.id)
      expect(updated?.status).toBe("completed")
    })

    it("should filter tasks by various criteria", async () => {
      await taskmaster.createTask({
        title: "High Priority Task",
        priority: "high",
        project_id: projectId,
        status: "pending",
      })

      await taskmaster.createTask({
        title: "Low Priority Task",
        priority: "low",
        project_id: projectId,
        status: "completed",
      })

      const highPriorityTasks = taskmaster.db.listTasks({
        priority: "high",
        project_id: projectId,
      })
      expect(highPriorityTasks.length).toBe(1)
      expect(highPriorityTasks[0].title).toBe("High Priority Task")

      const completedTasks = taskmaster.db.listTasks({
        status: "completed",
        project_id: projectId,
      })
      expect(completedTasks.length).toBe(1)
      expect(completedTasks[0].title).toBe("Low Priority Task")
    })
  })

  describe("Agent Management", () => {
    it("should create and manage agents", () => {
      const agent = taskmaster.db.createAgent({
        name: "Test Agent",
        role: "developer",
        skills: ["typescript", "react", "testing"],
        availability: 0.8,
        workload: 0.2,
      })

      expect(agent.id).toBeDefined()
      expect(agent.name).toBe("Test Agent")
      expect(agent.skills).toEqual(["typescript", "react", "testing"])

      const retrieved = taskmaster.db.getAgent(agent.id)
      expect(retrieved?.name).toBe("Test Agent")
    })

    it("should list agents with filters", () => {
      taskmaster.db.createAgent({
        name: "Developer Agent",
        role: "developer",
        skills: ["typescript"],
        availability: 1.0,
        workload: 0.0,
      })

      taskmaster.db.createAgent({
        name: "Designer Agent",
        role: "designer",
        skills: ["ui", "ux"],
        availability: 0.9,
        workload: 0.1,
      })

      const developers = taskmaster.db.listAgents({ role: "developer" })
      expect(developers.length).toBe(1)
      expect(developers[0].name).toBe("Developer Agent")

      const highAvailability = taskmaster.db.listAgents({ availability_min: 0.9 })
      expect(highAvailability.length).toBe(2)
    })

    it("should calculate agent efficiency metrics", async () => {
      const agent = taskmaster.db.createAgent({
        name: "Efficiency Test Agent",
        role: "developer",
        skills: ["typescript"],
        availability: 1.0,
        workload: 0.0,
      })

      // Create some tasks for the agent
      const task1 = await taskmaster.createTask({
        title: "Task 1",
        assignee_id: agent.id,
        project_id: (
          await taskmaster.createProject({
            name: "Test Project",
            team_members: ["test"],
          })
        ).id,
      })

      const task2 = await taskmaster.createTask({
        title: "Task 2",
        assignee_id: agent.id,
        project_id: task1.project_id,
      })

      // Complete one task
      await taskmaster.updateTaskProgress(task1.id, 100)

      const metrics = await taskmaster.getAgentMetrics(agent.id)
      expect(metrics.activeTasks).toBe(1) // task2 still active
      expect(metrics.completedTasks).toBe(1) // task1 completed
      expect(metrics.efficiency).toBeGreaterThan(0)
      expect(metrics.efficiency).toBeLessThanOrEqual(1)
    })
  })

  describe("Project Analytics", () => {
    let projectId: string

    beforeEach(async () => {
      const project = await taskmaster.createProject({
        name: "Analytics Test Project",
        status: "active",
        team_members: ["alice", "bob"],
      })
      projectId = project.id
    })

    it("should calculate project metrics accurately", async () => {
      // Create tasks with different statuses
      await taskmaster.createTask({
        title: "Completed Task",
        project_id: projectId,
        status: "completed",
      })

      await taskmaster.createTask({
        title: "In Progress Task",
        project_id: projectId,
        status: "in_progress",
      })

      await taskmaster.createTask({
        title: "Pending Task",
        project_id: projectId,
        status: "pending",
      })

      const metrics = await taskmaster.getProjectMetrics(projectId)

      expect(metrics.totalTasks).toBe(3)
      expect(metrics.completedTasks).toBe(1)
      expect(metrics.inProgressTasks).toBe(1)
      expect(metrics.completionRate).toBe(33.33) // 1/3 * 100, rounded
    })

    it("should generate project reports with recommendations", async () => {
      // Create a project with some issues
      await taskmaster.createTask({
        title: "Overdue Task",
        project_id: projectId,
        due_date: "2023-01-01", // Past date
        status: "pending",
      })

      await taskmaster.createTask({
        title: "Blocked Task",
        project_id: projectId,
        status: "blocked",
      })

      const report = await taskmaster.generateProjectReport(projectId)

      expect(report.project.id).toBe(projectId)
      expect(report.recommendations.length).toBeGreaterThan(0)
      expect(report.recommendations.some((rec) => rec.includes("overdue"))).toBe(true)
      expect(report.recommendations.some((rec) => rec.includes("blocked"))).toBe(true)
    })
  })

  describe("Task Dependencies", () => {
    let projectId: string
    let task1Id: string
    let task2Id: string

    beforeEach(async () => {
      const project = await taskmaster.createProject({
        name: "Dependency Test Project",
        team_members: ["alice"],
      })
      projectId = project.id

      const task1 = await taskmaster.createTask({
        title: "Task 1",
        project_id: projectId,
      })
      task1Id = task1.id

      const task2 = await taskmaster.createTask({
        title: "Task 2",
        project_id: projectId,
      })
      task2Id = task2.id
    })

    it("should manage task dependencies", async () => {
      await taskmaster.addTaskDependency(task2Id, task1Id, "finish_to_start")

      const dependencies = await taskmaster.getTaskDependencies(task2Id)
      expect(dependencies.blocking.length).toBe(1)
      expect(dependencies.blocking[0].id).toBe(task1Id)

      const dependents = await taskmaster.getTaskDependencies(task1Id)
      expect(dependents.blocked.length).toBe(1)
      expect(dependents.blocked[0].id).toBe(task2Id)
    })

    it("should prevent circular dependencies", async () => {
      await taskmaster.addTaskDependency(task2Id, task1Id, "finish_to_start")

      // Try to create circular dependency
      const result = await taskmaster.addTaskDependency(task1Id, task2Id, "finish_to_start")
      expect(result).toBe(false) // Should fail due to circular dependency
    })
  })

  describe("Workflow Execution", () => {
    it("should execute workflows with proper state management", async () => {
      const workflowId = "test-workflow-" + Date.now()

      const execution = await taskmaster.executeWorkflow(workflowId, {
        testData: "workflow test",
      })

      expect(execution.workflow_id).toBe(workflowId)
      expect(execution.status).toBe("completed")
      expect(execution.results).toBeDefined()
      expect(execution.metadata?.context?.testData).toBe("workflow test")
    })

    it("should handle workflow execution errors gracefully", async () => {
      // Test with invalid workflow ID
      const execution = await taskmaster.executeWorkflow("invalid-workflow-id")

      expect(execution.status).toBe("failed")
      expect(execution.error).toBeDefined()
    })
  })

  describe("Database Integrity", () => {
    it("should maintain referential integrity", async () => {
      const project = await taskmaster.createProject({
        name: "Integrity Test",
        team_members: ["alice"],
      })

      const task = await taskmaster.createTask({
        title: "Test Task",
        project_id: project.id,
      })

      // Delete project
      const deleted = taskmaster.db.deleteProject(project.id)
      expect(deleted).toBe(true)

      // Task should be automatically deleted due to CASCADE
      const taskAfterDelete = taskmaster.db.getTask(task.id)
      expect(taskAfterDelete).toBeNull()
    })

    it("should handle concurrent operations safely", async () => {
      const project = await taskmaster.createProject({
        name: "Concurrency Test",
        team_members: ["alice"],
      })

      // Create multiple tasks concurrently
      const promises = Array(10)
        .fill(null)
        .map((_, i) =>
          taskmaster.createTask({
            title: `Concurrent Task ${i}`,
            project_id: project.id,
          }),
        )

      const tasks = await Promise.all(promises)
      expect(tasks.length).toBe(10)
      tasks.forEach((task) => {
        expect(task.id).toBeDefined()
        expect(task.title).toMatch(/^Concurrent Task \d+$/)
      })
    })
  })

  describe("Performance & Optimization", () => {
    it("should handle large datasets efficiently", async () => {
      const project = await taskmaster.createProject({
        name: "Performance Test",
        team_members: ["alice"],
      })

      // Create many tasks
      const startTime = Date.now()
      const promises = Array(100)
        .fill(null)
        .map((_, i) =>
          taskmaster.createTask({
            title: `Performance Task ${i}`,
            project_id: project.id,
            description: "A".repeat(1000), // Large description
          }),
        )

      await Promise.all(promises)
      const endTime = Date.now()

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds

      // Should be able to retrieve all tasks
      const tasks = taskmaster.db.listTasks({ project_id: project.id })
      expect(tasks.length).toBe(100)
    })

    it("should optimize database queries", async () => {
      const project = await taskmaster.createProject({
        name: "Query Optimization Test",
        team_members: ["alice"],
      })

      // Create tasks with different statuses and priorities
      const tasks = []
      for (let i = 0; i < 50; i++) {
        const task = await taskmaster.createTask({
          title: `Query Test Task ${i}`,
          project_id: project.id,
          priority: i % 2 === 0 ? "high" : "low",
          status: i % 3 === 0 ? "completed" : i % 3 === 1 ? "in_progress" : "pending",
        })
        tasks.push(task)
      }

      // Test filtered queries
      const highPriorityTasks = taskmaster.db.listTasks({
        project_id: project.id,
        priority: "high",
      })
      expect(highPriorityTasks.length).toBe(25)

      const completedTasks = taskmaster.db.listTasks({
        project_id: project.id,
        status: "completed",
      })
      expect(completedTasks.length).toBe(Math.floor(50 / 3) + (50 % 3 >= 1 ? 1 : 0))
    })
  })
})
