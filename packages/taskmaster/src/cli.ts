#!/usr/bin/env node

/**
 * Opencode Taskmaster CLI
 * Command-line interface for task management and project orchestration
 */

import { Command } from "commander"
import { createTaskmaster } from "./index"
import { Task, Project, Agent } from "./database"

const program = new Command()

program
  .name("taskmaster")
  .description("Opencode Taskmaster - Advanced project orchestration and task management")
  .version("1.0.0")

// Initialize taskmaster
const taskmaster = createTaskmaster({
  dbPath: "./taskmaster.db",
  enableAutoAssignment: true,
  enableProgressTracking: true,
  enableDependencyManagement: true,
  maxConcurrentTasks: 5,
})

// Project commands
program
  .command("project:create <name>")
  .description("Create a new project")
  .option("-d, --description <desc>", "Project description")
  .option("-t, --team <members>", "Comma-separated team member IDs")
  .action(async (name, options) => {
    try {
      const project = await taskmaster.createProject({
        name,
        description: options.description,
        status: "planning",
        team_members: options.team ? options.team.split(",").map((m: string) => m.trim()) : [],
      })

      console.log(`✅ Project created: ${project.name} (${project.id})`)
    } catch (error) {
      console.error("❌ Failed to create project:", error)
      process.exit(1)
    }
  })

program
  .command("project:list")
  .description("List all projects")
  .action(async () => {
    try {
      const projects = taskmaster.db.listProjects()
      if (projects.length === 0) {
        console.log("No projects found")
        return
      }

      console.log("📋 Projects:")
      projects.forEach((project) => {
        const stats = taskmaster.db.getProjectStats(project.id)
        console.log(`  • ${project.name} (${project.status}) - ${stats.completedTasks}/${stats.totalTasks} tasks`)
      })
    } catch (error) {
      console.error("❌ Failed to list projects:", error)
      process.exit(1)
    }
  })

program
  .command("project:status <projectId>")
  .description("Show project status and metrics")
  .action(async (projectId) => {
    try {
      const project = taskmaster.db.getProject(projectId)
      if (!project) {
        console.error("❌ Project not found")
        process.exit(1)
      }

      const metrics = await taskmaster.getProjectMetrics(projectId)

      console.log(`📊 Project: ${project.name}`)
      console.log(`   Status: ${project.status}`)
      console.log(`   Description: ${project.description || "No description"}`)
      console.log(`   Team: ${project.team_members.join(", ") || "No team members"}`)
      console.log(
        `   Tasks: ${metrics.completedTasks}/${metrics.totalTasks} (${Math.round(metrics.completionRate)}% complete)`,
      )
      console.log(`   Average Task Duration: ${Math.round(metrics.averageTaskDuration)} hours`)

      if (metrics.estimatedCompletionDate) {
        console.log(`   Estimated Completion: ${metrics.estimatedCompletionDate}`)
      }
    } catch (error) {
      console.error("❌ Failed to get project status:", error)
      process.exit(1)
    }
  })

// Task commands
program
  .command("task:create <title>")
  .description("Create a new task")
  .option("-p, --project <projectId>", "Project ID")
  .option("-d, --description <desc>", "Task description")
  .option("--priority <priority>", "Task priority (low, medium, high, critical)", "medium")
  .option("--assignee <agentId>", "Assignee agent ID")
  .option("--estimated-hours <hours>", "Estimated hours", parseInt)
  .option("--due-date <date>", "Due date (YYYY-MM-DD)")
  .option("--tags <tags>", "Comma-separated tags")
  .action(async (title, options) => {
    try {
      const task = await taskmaster.createTask({
        title,
        description: options.description,
        status: "pending",
        priority: options.priority as Task["priority"],
        project_id: options.project,
        assignee_id: options.assignee,
        estimated_hours: options.estimatedHours,
        due_date: options.dueDate,
        tags: options.tags ? options.tags.split(",").map((t: string) => t.trim()) : [],
      })

      console.log(`✅ Task created: ${task.title} (${task.id})`)
      if (task.assignee_id) {
        console.log(`   Assigned to: ${task.assignee_id}`)
      }
    } catch (error) {
      console.error("❌ Failed to create task:", error)
      process.exit(1)
    }
  })

program
  .command("task:list")
  .description("List tasks")
  .option("-p, --project <projectId>", "Filter by project ID")
  .option("-s, --status <status>", "Filter by status")
  .option("-a, --assignee <agentId>", "Filter by assignee")
  .action(async (options) => {
    try {
      const filters: any = {}
      if (options.project) filters.project_id = options.project
      if (options.status) filters.status = options.status
      if (options.assignee) filters.assignee_id = options.assignee

      const tasks = taskmaster.db.listTasks(filters)

      if (tasks.length === 0) {
        console.log("No tasks found")
        return
      }

      console.log("📋 Tasks:")
      tasks.forEach((task) => {
        const assignee = task.assignee_id ? ` (${task.assignee_id})` : ""
        const dueDate = task.due_date ? ` - Due: ${task.due_date}` : ""
        console.log(`  • [${task.status.toUpperCase()}] ${task.title}${assignee}${dueDate}`)
      })
    } catch (error) {
      console.error("❌ Failed to list tasks:", error)
      process.exit(1)
    }
  })

program
  .command("task:update <taskId>")
  .description("Update task progress")
  .option("--progress <percentage>", "Progress percentage (0-100)", parseInt)
  .option("--status <status>", "Task status")
  .option("--assignee <agentId>", "Reassign to agent")
  .option("--notes <notes>", "Progress notes")
  .action(async (taskId, options) => {
    try {
      if (options.progress !== undefined) {
        await taskmaster.updateTaskProgress(taskId, options.progress, options.notes)
        console.log(`✅ Updated task progress: ${options.progress}%`)
      }

      if (options.status) {
        taskmaster.db.updateTask(taskId, { status: options.status })
        console.log(`✅ Updated task status: ${options.status}`)
      }

      if (options.assignee) {
        taskmaster.db.updateTask(taskId, { assignee_id: options.assignee })
        console.log(`✅ Reassigned task to: ${options.assignee}`)
      }
    } catch (error) {
      console.error("❌ Failed to update task:", error)
      process.exit(1)
    }
  })

program
  .command("task:dependencies <taskId>")
  .description("Show task dependencies")
  .action(async (taskId) => {
    try {
      const dependencies = await taskmaster.getTaskDependencies(taskId)

      console.log(`🔗 Dependencies for task ${taskId}:`)
      console.log(`   Blocking tasks: ${dependencies.blocking.length}`)
      dependencies.blocking.forEach((task) => {
        console.log(`     • ${task.title} (${task.status})`)
      })

      console.log(`   Blocked tasks: ${dependencies.blocked.length}`)
      dependencies.blocked.forEach((task) => {
        console.log(`     • ${task.title} (${task.status})`)
      })
    } catch (error) {
      console.error("❌ Failed to get dependencies:", error)
      process.exit(1)
    }
  })

// Agent commands
program
  .command("agent:list")
  .description("List all agents")
  .action(async () => {
    try {
      const agents = taskmaster.db.listAgents()

      if (agents.length === 0) {
        console.log("No agents found")
        return
      }

      console.log("🤖 Agents:")
      agents.forEach((agent) => {
        const workloadPercent = Math.round(agent.workload * 100)
        console.log(
          `  • ${agent.name} (${agent.role}) - ${workloadPercent}% workload, ${agent.active_tasks.length} active tasks`,
        )
        console.log(`    Skills: ${agent.skills.join(", ")}`)
      })
    } catch (error) {
      console.error("❌ Failed to list agents:", error)
      process.exit(1)
    }
  })

program
  .command("agent:metrics <agentId>")
  .description("Show agent performance metrics")
  .action(async (agentId) => {
    try {
      const metrics = await taskmaster.getAgentMetrics(agentId)

      console.log(`📊 Agent Metrics: ${agentId}`)
      console.log(`   Active Tasks: ${metrics.activeTasks}`)
      console.log(`   Completed Tasks: ${metrics.completedTasks}`)
      console.log(`   Average Task Duration: ${Math.round(metrics.averageTaskDuration)} hours`)
      console.log(`   Current Workload: ${Math.round(metrics.currentWorkload * 100)}%`)
      console.log(`   Efficiency: ${Math.round(metrics.efficiency * 100)}%`)
      console.log(`   Specialization: ${metrics.specialization.join(", ")}`)
    } catch (error) {
      console.error("❌ Failed to get agent metrics:", error)
      process.exit(1)
    }
  })

// Workflow commands
program
  .command("workflow:execute <workflowId>")
  .description("Execute a workflow")
  .option("--context <json>", "Workflow context as JSON string")
  .action(async (workflowId, options) => {
    try {
      const context = options.context ? JSON.parse(options.context) : {}
      const execution = await taskmaster.executeWorkflow(workflowId, context)

      console.log(`🚀 Workflow execution started: ${execution.id}`)
      console.log(`   Status: ${execution.status}`)

      if (execution.error) {
        console.error(`❌ Execution failed: ${execution.error}`)
        process.exit(1)
      }
    } catch (error) {
      console.error("❌ Failed to execute workflow:", error)
      process.exit(1)
    }
  })

// Analytics commands
program
  .command("analytics:project <projectId>")
  .description("Generate project analytics report")
  .action(async (projectId) => {
    try {
      const report = await taskmaster.generateProjectReport(projectId)

      console.log(`📊 Project Report: ${report.project.name}`)
      console.log(`   Status: ${report.project.status}`)
      console.log(`   Completion: ${Math.round(report.metrics.completionRate)}%`)
      console.log(`   Tasks: ${report.metrics.completedTasks}/${report.metrics.totalTasks}`)
      console.log(`   Average Duration: ${Math.round(report.metrics.averageTaskDuration)} hours`)

      if (report.recommendations.length > 0) {
        console.log(`   Recommendations:`)
        report.recommendations.forEach((rec) => console.log(`     • ${rec}`))
      }
    } catch (error) {
      console.error("❌ Failed to generate report:", error)
      process.exit(1)
    }
  })

// Database maintenance
program
  .command("db:backup <path>")
  .description("Create database backup")
  .action(async (path) => {
    try {
      await taskmaster.backup(path)
      console.log(`✅ Database backup created: ${path}`)
    } catch (error) {
      console.error("❌ Failed to create backup:", error)
      process.exit(1)
    }
  })

program
  .command("db:optimize")
  .description("Optimize database performance")
  .action(async () => {
    try {
      await taskmaster.optimize()
      console.log("✅ Database optimized")
    } catch (error) {
      console.error("❌ Failed to optimize database:", error)
      process.exit(1)
    }
  })

// Help and info
program
  .command("status")
  .description("Show system status")
  .action(async () => {
    try {
      const projects = taskmaster.db.listProjects()
      const agents = taskmaster.db.listAgents()
      const tasks = taskmaster.db.listTasks()

      console.log("📊 Opencode Taskmaster Status")
      console.log(`   Projects: ${projects.length}`)
      console.log(`   Agents: ${agents.length}`)
      console.log(`   Total Tasks: ${tasks.length}`)
      console.log(`   Completed Tasks: ${tasks.filter((t) => t.status === "completed").length}`)
      console.log(`   In Progress Tasks: ${tasks.filter((t) => t.status === "in_progress").length}`)
      console.log(`   Pending Tasks: ${tasks.filter((t) => t.status === "pending").length}`)
    } catch (error) {
      console.error("❌ Failed to get status:", error)
      process.exit(1)
    }
  })

program
  .command("init")
  .description("Initialize taskmaster with default agents and configuration")
  .action(async () => {
    try {
      console.log("🚀 Initializing Opencode Taskmaster...")

      // Default agents are created automatically in the constructor
      console.log("✅ Default agents created")
      console.log("✅ Database schema initialized")
      console.log("✅ Taskmaster ready for use")

      console.log("\n📋 Quick Start:")
      console.log('   1. Create a project: taskmaster project:create "My Project"')
      console.log('   2. Add tasks: taskmaster task:create "My Task" --project <project-id>')
      console.log("   3. Check status: taskmaster status")
    } catch (error) {
      console.error("❌ Failed to initialize:", error)
      process.exit(1)
    }
  })

// Error handling
program.on("command:*", (unknownCommand) => {
  console.error(`❌ Unknown command: ${unknownCommand[0]}`)
  console.log('Run "taskmaster --help" to see available commands')
  process.exit(1)
})

// If no command is provided, show help
if (process.argv.length === 2) {
  program.help()
}

program.parse(process.argv)
