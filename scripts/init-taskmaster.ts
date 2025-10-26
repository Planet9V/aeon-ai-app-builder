#!/usr/bin/env tsx

/**
 * Initialize Taskmaster Database for Wave 4 Audit
 */

import Database from "better-sqlite3"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const dbPath = path.join(process.cwd(), "data", "taskmaster.db")
const db = new Database(dbPath)

console.log("📊 Initializing Taskmaster Database...")
console.log(`📁 Database: ${dbPath}`)

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('planning','active','on_hold','completed','cancelled')) DEFAULT 'active',
    start_date TEXT,
    end_date TEXT,
    budget REAL,
    team_members TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS phases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    project_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending','active','completed')) DEFAULT 'pending',
    start_date TEXT,
    end_date TEXT,
    progress_percentage REAL DEFAULT 0,
    dependencies TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('pending','in_progress','completed','blocked','cancelled')) DEFAULT 'pending',
    priority TEXT CHECK(priority IN ('low','medium','high','critical')) DEFAULT 'medium',
    assignee_id TEXT,
    project_id TEXT,
    phase_id TEXT,
    parent_task_id TEXT,
    estimated_hours REAL,
    actual_hours REAL,
    due_date TEXT,
    tags TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (phase_id) REFERENCES phases(id)
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    skills TEXT,
    availability REAL DEFAULT 1.0,
    workload REAL DEFAULT 0.0,
    active_tasks TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS task_progress (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    progress_percentage REAL NOT NULL,
    notes TEXT,
    recorded_by TEXT NOT NULL,
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );

  CREATE TABLE IF NOT EXISTS audit_findings (
    id TEXT PRIMARY KEY,
    audit_id TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('critical','major','minor','info')) DEFAULT 'info',
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    line_number INTEGER,
    agent_id TEXT,
    status TEXT CHECK(status IN ('open','in_progress','resolved','wont_fix')) DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_findings_audit ON audit_findings(audit_id);
  CREATE INDEX IF NOT EXISTS idx_findings_severity ON audit_findings(severity);
`)

console.log("✅ Tables created successfully")

// Create Wave 4 project
const projectId = "wave4-ai-integration"
const insertProject = db.prepare(`
  INSERT OR REPLACE INTO projects (id, name, description, status, start_date, team_members, metadata)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

insertProject.run(
  projectId,
  "Wave 4: AI Integration & BMAD Workflow",
  "Integrate AI capabilities into the IDE, implementing the BMAD workflow with OpenRouter for multi-model AI access",
  "active",
  "2024-10-25",
  JSON.stringify(["Senior Developer", "AI Specialist", "QA Engineer", "System Architect"]),
  JSON.stringify({ wave: 4, targetProgress: 100, currentProgress: 75 }),
)

console.log("✅ Wave 4 project created")

// Create specialized agents
const agents = [
  {
    id: "agent-senior-dev",
    name: "Senior Developer",
    role: "Code Quality & Implementation",
    skills: JSON.stringify(["TypeScript", "React", "Code Review", "Testing", "Performance"]),
  },
  {
    id: "agent-architect",
    name: "System Architect",
    role: "Architecture & Design",
    skills: JSON.stringify(["System Design", "Scalability", "API Design", "Patterns"]),
  },
  {
    id: "agent-qa",
    name: "QA Engineer",
    role: "Testing & Quality Assurance",
    skills: JSON.stringify(["Testing", "Vitest", "Coverage Analysis", "Test Strategy"]),
  },
  {
    id: "agent-tech-writer",
    name: "Technical Writer",
    role: "Documentation Review",
    skills: JSON.stringify(["Documentation", "Technical Writing", "API Docs", "Tutorials"]),
  },
  {
    id: "agent-integration",
    name: "Integration Specialist",
    role: "Integration Completeness",
    skills: JSON.stringify(["Integration", "UI/UX", "User Flows", "State Management"]),
  },
]

const insertAgent = db.prepare(`
  INSERT OR REPLACE INTO agents (id, name, role, skills, availability, workload)
  VALUES (?, ?, ?, ?, ?, ?)
`)

agents.forEach((agent) => {
  insertAgent.run(agent.id, agent.name, agent.role, agent.skills, 1.0, 0.0)
})

console.log(`✅ ${agents.length} specialized agents created`)

// Create audit tasks
const auditTasks = [
  {
    id: uuidv4(),
    title: "Code Quality Audit - OpenRouter SDK",
    description: "Review OpenRouter SDK implementation for quality, completeness, and best practices",
    priority: "high",
    assignee_id: "agent-senior-dev",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "code-quality", "openrouter-sdk"]),
  },
  {
    id: uuidv4(),
    title: "Code Quality Audit - BMAD Workflow",
    description: "Review BMAD workflow engine and agents implementation",
    priority: "high",
    assignee_id: "agent-senior-dev",
    estimated_hours: 3,
    tags: JSON.stringify(["audit", "code-quality", "bmad"]),
  },
  {
    id: uuidv4(),
    title: "Architecture Review - State Management",
    description: "Review Zustand stores and state management patterns",
    priority: "high",
    assignee_id: "agent-architect",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "architecture", "state"]),
  },
  {
    id: uuidv4(),
    title: "Architecture Review - Component Integration",
    description: "Review component architecture and integration readiness",
    priority: "high",
    assignee_id: "agent-architect",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "architecture", "integration"]),
  },
  {
    id: uuidv4(),
    title: "Testing Review - Test Coverage",
    description: "Analyze test coverage and identify gaps",
    priority: "high",
    assignee_id: "agent-qa",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "testing", "coverage"]),
  },
  {
    id: uuidv4(),
    title: "Testing Review - Test Quality",
    description: "Review test quality, mocking strategy, and edge cases",
    priority: "high",
    assignee_id: "agent-qa",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "testing", "quality"]),
  },
  {
    id: uuidv4(),
    title: "Documentation Review - API Docs",
    description: "Review API documentation completeness and quality",
    priority: "medium",
    assignee_id: "agent-tech-writer",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "documentation", "api"]),
  },
  {
    id: uuidv4(),
    title: "Documentation Review - User Guides",
    description: "Review user documentation and tutorials",
    priority: "medium",
    assignee_id: "agent-tech-writer",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "documentation", "guides"]),
  },
  {
    id: uuidv4(),
    title: "Integration Check - EditorPage",
    description: "Check EditorPage integration completeness",
    priority: "critical",
    assignee_id: "agent-integration",
    estimated_hours: 3,
    tags: JSON.stringify(["audit", "integration", "editor"]),
  },
  {
    id: uuidv4(),
    title: "Integration Check - User Flows",
    description: "Verify end-to-end user flows and feature accessibility",
    priority: "high",
    assignee_id: "agent-integration",
    estimated_hours: 2,
    tags: JSON.stringify(["audit", "integration", "ux"]),
  },
]

const insertTask = db.prepare(`
  INSERT INTO tasks (id, title, description, priority, assignee_id, project_id, estimated_hours, tags, metadata)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

auditTasks.forEach((task) => {
  insertTask.run(
    task.id,
    task.title,
    task.description,
    task.priority,
    task.assignee_id,
    projectId,
    task.estimated_hours,
    task.tags,
    JSON.stringify({ type: "audit", wave: 4 }),
  )
})

console.log(`✅ ${auditTasks.length} audit tasks created`)

// Summary
const stats = {
  projects: db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number },
  tasks: db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number },
  agents: db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number },
}

console.log("\n📊 Database Summary:")
console.log(`   Projects: ${stats.projects.count}`)
console.log(`   Tasks: ${stats.tasks.count}`)
console.log(`   Agents: ${stats.agents.count}`)
console.log("\n✅ Taskmaster database initialized successfully!")

db.close()
