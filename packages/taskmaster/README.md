# @opencode/taskmaster

**Advanced Taskmaster System for Opencode Framework**

A comprehensive SQLite-based task management and project orchestration system designed specifically for AI-augmented development workflows.

## 🚀 Features

### Core Capabilities

- **SQLite Database Backend**: Persistent, reliable task storage
- **Multi-Agent Orchestration**: Intelligent task assignment and coordination
- **Progress Tracking**: Real-time task progress with detailed metrics
- **Dependency Management**: Complex task relationships and critical paths
- **Project Analytics**: Comprehensive project health and performance insights

### AI Integration

- **Smart Task Assignment**: AI-powered agent matching and workload balancing
- **Predictive Analytics**: Task duration estimation and project completion forecasting
- **Automated Insights**: AI-generated recommendations for project optimization
- **Workflow Intelligence**: Learning from past projects to improve future performance

### Developer Experience

- **CLI Interface**: Command-line tools for efficient task management
- **React Components**: Visual dashboard for project oversight
- **Real-time Updates**: Live progress tracking and notifications
- **Extensible Architecture**: Plugin system for custom integrations

## 📦 Installation

```bash
# Install the package
npm install @opencode/taskmaster

# Or with yarn
yarn add @opencode/taskmaster

# Or with pnpm
pnpm add @opencode/taskmaster
```

## 🚀 Quick Start

### 1. Initialize Taskmaster

```typescript
import { createTaskmaster } from "@opencode/taskmaster"

const taskmaster = createTaskmaster({
  dbPath: "./taskmaster.db",
  enableAutoAssignment: true,
  enableProgressTracking: true,
  enableDependencyManagement: true,
  maxConcurrentTasks: 5,
})
```

### 2. Create Your First Project

```typescript
const project = await taskmaster.createProject({
  name: "AI Chat Application",
  description: "Modern chat app with AI integration",
  status: "active",
  team_members: ["alice", "bob", "charlie"],
})
```

### 3. Add Tasks and Track Progress

```typescript
// Create a task
const task = await taskmaster.createTask({
  title: "Implement AI Chat Component",
  description: "Build React component for AI conversations",
  priority: "high",
  project_id: project.id,
  estimated_hours: 8,
  tags: ["frontend", "ai", "react"],
})

// Update progress
await taskmaster.updateTaskProgress(task.id, 75, "Component structure complete, adding AI integration")
```

### 4. Monitor Project Health

```typescript
const metrics = await taskmaster.getProjectMetrics(project.id)
console.log(`Project ${metrics.completionRate}% complete`)
console.log(`Estimated completion: ${metrics.estimatedCompletionDate}`)
```

## 🛠️ CLI Usage

The taskmaster includes a powerful CLI for efficient project management:

```bash
# Initialize taskmaster
npx taskmaster init

# Create a project
npx taskmaster project:create "My Project" --description "Project description"

# Add tasks
npx taskmaster task:create "Implement feature" --project <project-id> --priority high

# Update progress
npx taskmaster task:update <task-id> --progress 50 --notes "Halfway complete"

# View project status
npx taskmaster project:status <project-id>

# Get system overview
npx taskmaster status
```

## 📊 React Components

### TaskmasterDashboard

Full-featured dashboard for project management:

```tsx
import { TaskmasterDashboard } from "@opencode/taskmaster"

function App() {
  const taskmaster = createTaskmaster()

  return <TaskmasterDashboard taskmaster={taskmaster} />
}
```

**Features:**

- Project overview with key metrics
- Task management with progress tracking
- Agent performance monitoring
- Real-time collaboration features
- Analytics and reporting

## 🏗️ Architecture

### Database Schema

The taskmaster uses SQLite with the following core tables:

- **projects**: Project definitions and metadata
- **phases**: Project phases and milestones
- **tasks**: Individual tasks with full metadata
- **task_dependencies**: Task relationship management
- **task_progress**: Progress tracking and history
- **agents**: AI/development agents and capabilities
- **workflow_executions**: Automated workflow runs

### Key Components

- **Database Layer**: SQLite abstraction with migrations
- **Task Engine**: Core task management and orchestration
- **Agent System**: Intelligent agent assignment and monitoring
- **Analytics Engine**: Project metrics and insights
- **CLI Interface**: Command-line tools and automation
- **React Components**: Visual dashboard and interfaces

## 🤖 AI-Powered Features

### Intelligent Task Assignment

- **Skill Matching**: Automatically assign tasks based on agent capabilities
- **Workload Balancing**: Distribute work evenly across available agents
- **Priority Optimization**: Consider task urgency and dependencies
- **Learning Adaptation**: Improve assignments based on past performance

### Predictive Analytics

- **Duration Estimation**: Predict task completion times
- **Risk Assessment**: Identify potential project delays
- **Resource Planning**: Forecast resource needs
- **Performance Insights**: Continuous improvement recommendations

### Automated Workflows

- **Template System**: Pre-built workflows for common patterns
- **Dependency Resolution**: Automatic task sequencing
- **Quality Gates**: Automated testing and validation
- **Notification System**: Smart alerts and updates

## 📈 Use Cases

### Startup Development

- **MVP Acceleration**: Rapid prototyping with AI assistance
- **Team Coordination**: Small team collaboration and tracking
- **Resource Optimization**: Maximize limited developer resources
- **Quality Assurance**: Automated testing and code review

### Enterprise Projects

- **Large-Scale Coordination**: Complex project orchestration
- **Multi-Team Management**: Cross-team dependency tracking
- **Compliance Tracking**: Audit trails and regulatory compliance
- **Performance Analytics**: Enterprise-grade reporting

### AI Research & Development

- **Experiment Tracking**: AI model training and evaluation
- **Workflow Automation**: Research pipeline orchestration
- **Knowledge Management**: Research findings and documentation
- **Collaboration Platform**: Multi-researcher coordination

## 🔧 Configuration

### Basic Configuration

```typescript
const taskmaster = createTaskmaster({
  dbPath: "./data/taskmaster.db", // Database location
  enableAutoAssignment: true, // Auto-assign tasks to agents
  enableProgressTracking: true, // Track detailed progress
  enableDependencyManagement: true, // Manage task dependencies
  maxConcurrentTasks: 5, // Max concurrent tasks per agent
})
```

### Advanced Configuration

```typescript
const taskmaster = createTaskmaster({
  // Database settings
  dbPath: "./taskmaster.db",

  // Feature toggles
  enableAutoAssignment: true,
  enableProgressTracking: true,
  enableDependencyManagement: true,

  // Performance settings
  maxConcurrentTasks: 5,
  cacheSize: 1000,
  retentionDays: 90,

  // Integration settings
  integrations: {
    github: { enabled: true, token: "..." },
    slack: { enabled: true, webhook: "..." },
    jira: { enabled: false },
  },
})
```

## 🔌 Integrations

### Version Control

- **GitHub**: Issue tracking, PR management, commit linking
- **GitLab**: CI/CD integration, merge request tracking
- **Bitbucket**: Repository management and workflow integration

### Communication

- **Slack**: Real-time notifications and team updates
- **Discord**: Community engagement and support
- **Microsoft Teams**: Enterprise communication integration

### Project Management

- **Jira**: Issue synchronization and workflow management
- **Linear**: Modern project tracking integration
- **Trello**: Kanban board synchronization

### CI/CD

- **GitHub Actions**: Automated deployment and testing
- **Jenkins**: Legacy CI/CD system integration
- **CircleCI**: Cloud-based CI/CD workflows

## 📚 API Reference

### Core Classes

#### `OpencodeTaskmaster`

Main taskmaster class with all functionality.

**Methods:**

- `createProject(project)`: Create a new project
- `createTask(task)`: Create a new task
- `updateTaskProgress(taskId, progress, notes)`: Update task progress
- `getProjectMetrics(projectId)`: Get project analytics
- `executeWorkflow(workflowId, context)`: Execute automated workflow

#### `TaskmasterDatabase`

SQLite database abstraction layer.

**Methods:**

- `createProject/project/task/phase`: Create entities
- `getProject/project/task/phase`: Retrieve entities
- `updateProject/project/task/phase`: Update entities
- `listProjects/tasks/agents`: Query collections
- `recordProgress`: Track task progress

### Type Definitions

```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  assignee_id?: string
  project_id?: string
  phase_id?: string
  estimated_hours?: number
  actual_hours?: number
  due_date?: string
  tags?: string[]
  metadata?: Record<string, any>
}

interface Project {
  id: string
  name: string
  description?: string
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  team_members: string[]
  metadata?: Record<string, any>
}

interface Agent {
  id: string
  name: string
  role: string
  skills: string[]
  availability: number // 0-1
  workload: number // 0-1
  active_tasks: string[]
}
```

## 🤝 Contributing

We welcome contributions to the Opencode Taskmaster!

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Planet9V/Opencode_Template.git
cd Opencode_Template/packages/taskmaster

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run the CLI
npm run cli -- --help
```

### Code Standards

- **TypeScript**: Strict typing throughout
- **Testing**: 80%+ code coverage required
- **Documentation**: JSDoc comments for all public APIs
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent formatting

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Opencode Framework Docs](https://docs.opencode.dev)
- **Issues**: [GitHub Issues](https://github.com/Planet9V/Opencode_Template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Planet9V/Opencode_Template/discussions)

## 🙏 Acknowledgments

Built with ❤️ by the Opencode Team, powered by:

- **SQLite**: Reliable embedded database
- **Better SQLite3**: High-performance SQLite bindings
- **React**: UI component foundation
- **TypeScript**: Type-safe development
- **OpenRouter**: AI model orchestration

---

**Transform your development workflow with intelligent task management and AI-powered orchestration.** 🚀✨
