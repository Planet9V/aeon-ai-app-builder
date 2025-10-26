# OpenSPG Technical Reference

## 📚 Complete API and Implementation Reference

---

## Table of Contents

1. [Package APIs](#package-apis)
2. [Hook Reference](#hook-reference)
3. [Component Reference](#component-reference)
4. [Taskmaster API](#taskmaster-api)
5. [Type Definitions](#type-definitions)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)

---

## Package APIs

### @opencode/ai-hooks

#### Installation

```bash
bun add @opencode/ai-hooks
```

#### Basic Setup

```typescript
import { useAI, useChat, useWorkflow } from "@opencode/ai-hooks"
import { initializeOpenRouter } from "@opencode/openrouter-sdk"

// Initialize OpenRouter
await initializeOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: "openai/gpt-4o-mini",
})
```

---

## Hook Reference

### Core Hooks (v1.0)

#### useAI()

**Purpose**: Single AI completions with conversation history

**Signature**:

```typescript
function useAI(config?: UseAIConfig): UseAIReturn
```

**Config**:

```typescript
interface UseAIConfig {
  model?: string // Default: 'openai/gpt-4o-mini'
  temperature?: number // Default: 0.7
  maxTokens?: number // Default: undefined
  autoInitialize?: boolean // Default: true
}
```

**Returns**:

```typescript
interface UseAIReturn {
  isLoading: boolean
  error: string | null
  response: AIResponse | null
  history: AIMessage[]
  generate: (prompt: string, systemMessage?: string, options?: Partial<UseAIConfig>) => Promise<AIResponse | null>
  clearHistory: () => void
  clearError: () => void
}
```

**Example**:

```typescript
const { generate, isLoading, error, response } = useAI({
  model: "openai/gpt-4o",
  temperature: 0.7,
})

const handleGenerate = async () => {
  const result = await generate("Explain quantum computing", "You are a physics teacher")
  console.log(result?.content)
}
```

---

#### useChat()

**Purpose**: Conversational AI with message history

**Signature**:

```typescript
function useChat(config?: UseAIConfig): UseChatReturn
```

**Returns**:

```typescript
interface UseChatReturn {
  messages: AIMessage[]
  isLoading: boolean
  error: string | null
  selectedModel: string
  sendMessage: (content: string, systemMessage?: string) => Promise<AIResponse | null>
  clearChat: () => void
  changeModel: (model: string) => void
}
```

**Example**:

```typescript
const { messages, sendMessage, isLoading } = useChat()

const handleSend = async (text: string) => {
  await sendMessage(text, "You are a helpful assistant")
}
```

---

#### useStreamingChat()

**Purpose**: Real-time streaming AI responses

**Signature**:

```typescript
function useStreamingChat(config?: UseAIConfig): UseStreamingChatReturn
```

**Returns**:

```typescript
interface UseStreamingChatReturn {
  messages: AIMessage[]
  isLoading: boolean
  error: string | null
  selectedModel: string
  currentStreamedContent: string
  sendMessage: (
    content: string,
    systemMessage?: string,
    onChunk?: (chunk: string) => void,
  ) => Promise<AIResponse | null>
  clearChat: () => void
  changeModel: (model: string) => void
}
```

**Example**:

```typescript
const { sendMessage, currentStreamedContent } = useStreamingChat()

await sendMessage("Tell me a story", undefined, (chunk) => console.log("Received:", chunk))
```

---

#### useCodeGeneration()

**Purpose**: Programming assistant with code generation, review, and explanation

**Signature**:

```typescript
function useCodeGeneration(config?: UseAIConfig): UseCodeGenerationReturn
```

**Returns**:

```typescript
interface UseCodeGenerationReturn extends UseAIReturn {
  generateCode: (prompt: string, language?: string, context?: string) => Promise<AIResponse | null>
  reviewCode: (code: string, language?: string) => Promise<AIResponse | null>
  explainCode: (code: string, language?: string) => Promise<AIResponse | null>
}
```

**Example**:

```typescript
const { generateCode, reviewCode, explainCode } = useCodeGeneration()

// Generate code
const code = await generateCode(
  "Create a React counter component",
  "typescript",
  "React functional component with hooks",
)

// Review code
const review = await reviewCode(code.content, "typescript")

// Explain code
const explanation = await explainCode(code.content, "typescript")
```

---

### Advanced Hooks (v2.0)

#### useWorkflow()

**Purpose**: Multi-agent orchestration with dependency management

**Signature**:

```typescript
function useWorkflow(): UseWorkflowReturn
```

**Types**:

```typescript
interface Agent {
  id: string
  name: string
  role: string
  model: string
  systemMessage: string
  dependencies?: string[]
  maxRetries?: number
}

interface WorkflowStep {
  id: string
  agentId: string
  input: string
  output?: string
  status: "pending" | "running" | "completed" | "failed"
  error?: string
  startTime?: Date
  endTime?: Date
}

interface Workflow {
  id: string
  name: string
  description: string
  agents: Agent[]
  steps: WorkflowStep[]
  status: "idle" | "running" | "completed" | "failed"
  results: Record<string, any>
}
```

**Returns**:

```typescript
interface UseWorkflowReturn {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  isRunning: boolean
  createWorkflow: (name: string, description: string, agents: Agent[]) => string
  addWorkflowStep: (workflowId: string, agentId: string, input: string) => boolean
  executeWorkflow: (workflowId: string) => Promise<Workflow | null>
  getWorkflow: (workflowId: string) => Workflow | null
  deleteWorkflow: (workflowId: string) => boolean
}
```

**Example**:

```typescript
const { createWorkflow, addWorkflowStep, executeWorkflow } = useWorkflow()

// Define agents
const agents: Agent[] = [
  {
    id: "security-agent",
    name: "Security Reviewer",
    role: "security",
    model: "openai/gpt-4o",
    systemMessage: "You are a cybersecurity expert...",
  },
  {
    id: "performance-agent",
    name: "Performance Optimizer",
    role: "performance",
    model: "anthropic/claude-3.5-sonnet",
    systemMessage: "You are a performance expert...",
    dependencies: ["security-agent"],
  },
]

// Create workflow
const workflowId = createWorkflow("Code Review", "Multi-agent code review", agents)

// Add steps
addWorkflowStep(workflowId, "security-agent", "Review this code for security issues")
addWorkflowStep(workflowId, "performance-agent", "Optimize this code for performance")

// Execute
const result = await executeWorkflow(workflowId)
```

---

#### useCodeSuggestions()

**Purpose**: AI-powered code intelligence and suggestions

**Signature**:

```typescript
function useCodeSuggestions(config?: UseAIConfig): UseCodeSuggestionsReturn
```

**Types**:

```typescript
interface CodeSuggestion {
  id: string
  type: "completion" | "refactor" | "optimization" | "bugfix"
  content: string
  description: string
  confidence: number
  lineNumber?: number
  language: string
}
```

**Returns**:

```typescript
interface UseCodeSuggestionsReturn {
  suggestions: CodeSuggestion[]
  isAnalyzing: boolean
  analyzeCode: (code: string, language: string, context?: string) => Promise<CodeSuggestion[]>
  getSuggestionsForLine: (lineNumber: number) => CodeSuggestion[]
  applySuggestion: (suggestionId: string) => CodeSuggestion | null
  clearSuggestions: () => void
}
```

**Example**:

```typescript
const { suggestions, analyzeCode, applySuggestion } = useCodeSuggestions()

// Analyze code
const code = `
function processData(data) {
  return data.map(item => item.id)
}
`

const results = await analyzeCode(code, "typescript", "Data processing function")

// Apply high-confidence suggestions
results.forEach((suggestion) => {
  if (suggestion.confidence > 0.8) {
    applySuggestion(suggestion.id)
  }
})
```

---

#### useAnalytics()

**Purpose**: Usage tracking and cost management

**Signature**:

```typescript
function useAnalytics(): UseAnalyticsReturn
```

**Types**:

```typescript
interface UsageMetrics {
  totalRequests: number
  totalCost: number
  totalInputTokens: number
  totalOutputTokens: number
  averageResponseTime: number
  modelUsage: Record<string, { requests: number; cost: number }>
  cacheHitRate: number
}

interface CallHistoryEntry {
  id: string
  timestamp: Date
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  responseTime: number
  cached: boolean
}
```

**Returns**:

```typescript
interface UseAnalyticsReturn {
  metrics: UsageMetrics
  callHistory: CallHistoryEntry[]
  recordCall: (model: string, inputTokens: number, outputTokens: number, responseTime: number, cached: boolean) => void
  getMetrics: () => UsageMetrics
  exportData: (format: "json" | "csv") => string
  clearHistory: () => void
  setTracking: (enabled: boolean) => void
}
```

**Example**:

```typescript
const { metrics, recordCall, exportData } = useAnalytics()

// Record AI call
recordCall("openai/gpt-4o", 150, 50, 1250, false)

// Get metrics
console.log(`Total cost: $${metrics.totalCost}`)
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`)

// Export data
const csvData = exportData("csv")
```

---

#### useCache()

**Purpose**: Smart response caching with TTL management

**Signature**:

```typescript
function useCache(maxSize?: number, defaultTTL?: number): UseCacheReturn
```

**Parameters**:

- `maxSize`: Maximum cache entries (default: 1000)
- `defaultTTL`: Time to live in milliseconds (default: 3600000 = 1 hour)

**Types**:

```typescript
interface CacheEntry {
  id: string
  key: string
  content: string
  model: string
  timestamp: Date
  ttl: number
  hits: number
  metadata?: Record<string, any>
}
```

**Returns**:

```typescript
interface UseCacheReturn {
  get: (key: string) => CacheEntry | null
  set: (key: string, content: string, model: string, ttl?: number, metadata?: Record<string, any>) => void
  invalidate: (pattern?: string) => number
  getStats: () => { hits: number; misses: number; evictions: number; hitRate: number }
  generateKey: (messages: AIMessage[], model: string, options?: any) => string
}
```

**Example**:

```typescript
const { get, set, generateKey } = useCache(5000, 7200000) // 2 hour TTL

// Generate cache key
const key = generateKey(messages, "openai/gpt-4o", { temperature: 0.7 })

// Check cache
let response = get(key)
if (!response) {
  // Generate new response
  response = await generate(messages)
  set(key, response.content, "openai/gpt-4o")
}
```

---

#### useCollaboration()

**Purpose**: Real-time team collaboration on AI interactions

**Signature**:

```typescript
function useCollaboration(userId: string, userName: string): UseCollaborationReturn
```

**Types**:

```typescript
interface CollaborationSession {
  id: string
  name: string
  participants: string[]
  messages: AIMessage[]
  currentModel: string
  isActive: boolean
  createdAt: Date
  lastActivity: Date
}

interface CollaborationMessage {
  id: string
  sessionId: string
  userId: string
  userName: string
  type: "message" | "model_change" | "join" | "leave"
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}
```

**Returns**:

```typescript
interface UseCollaborationReturn {
  sessions: CollaborationSession[]
  currentSession: CollaborationSession | null
  messages: CollaborationMessage[]
  isConnected: boolean
  createSession: (name: string) => string
  joinSession: (sessionId: string) => boolean
  leaveSession: () => void
  sendCollaborativeMessage: (content: string, type?: "message" | "model_change") => Promise<boolean>
  changeModel: (model: string) => Promise<boolean>
}
```

**Example**:

```typescript
const { createSession, sendCollaborativeMessage, messages } = useCollaboration("user123", "John Doe")

// Create session
const sessionId = createSession("Sprint Planning Session")

// Send message
await sendCollaborativeMessage("Let's analyze our sprint goals")

// All team members see messages in real-time
messages.forEach((msg) => console.log(`${msg.userName}: ${msg.content}`))
```

---

## Component Reference

### @opencode/ui-components

#### AIModelSelector

**Purpose**: Model marketplace with descriptions and switching

**Props**:

```typescript
interface AIModelSelectorProps {
  onModelChange?: (model: string) => void
  defaultModel?: string
  showDescription?: boolean
  compact?: boolean
  className?: string
}
```

**Example**:

```tsx
<AIModelSelector
  onModelChange={(model) => console.log("Selected:", model)}
  defaultModel="openai/gpt-4o-mini"
  showDescription={true}
  compact={false}
/>
```

---

#### AIChat

**Purpose**: Ready-to-use chat interface

**Props**:

```typescript
interface AIChatProps {
  title?: string
  systemMessage?: string
  placeholder?: string
  showModelSelector?: boolean
  compact?: boolean
  className?: string
}
```

**Example**:

```tsx
<AIChat
  title="AI Assistant"
  systemMessage="You are a helpful coding assistant"
  placeholder="Ask me anything..."
  showModelSelector={true}
  compact={false}
/>
```

---

#### WorkflowBuilder

**Purpose**: Visual workflow creation and management

**Props**:

```typescript
interface WorkflowBuilderProps {
  onWorkflowSave?: (workflow: Workflow) => void
  className?: string
}
```

**Example**:

```tsx
<WorkflowBuilder
  onWorkflowSave={(workflow) => {
    console.log("Workflow saved:", workflow)
  }}
  className="h-full"
/>
```

**Features**:

- Drag-and-drop agent configuration
- Dependency visualization
- Real-time execution monitoring
- Pre-built templates

---

#### AnalyticsDashboard

**Purpose**: Enterprise analytics and cost tracking

**Props**:

```typescript
interface AnalyticsDashboardProps {
  className?: string
}
```

**Example**:

```tsx
<AnalyticsDashboard className="w-full" />
```

**Features**:

- Cost tracking
- Usage metrics
- Model comparison
- Export capabilities

---

#### CollaborationPanel

**Purpose**: Team collaboration hub

**Props**:

```typescript
interface CollaborationPanelProps {
  userId: string
  userName: string
  className?: string
}
```

**Example**:

```tsx
<CollaborationPanel userId="user123" userName="John Doe" className="h-screen" />
```

**Features**:

- Real-time messaging
- Shared sessions
- Participant tracking
- Model switching

---

#### CodeSuggestionsPanel

**Purpose**: AI code intelligence interface

**Props**:

```typescript
interface CodeSuggestionsPanelProps {
  className?: string
}
```

**Example**:

```tsx
<CodeSuggestionsPanel className="max-w-4xl" />
```

**Features**:

- Code analysis
- Multi-language support
- Confidence scoring
- One-click application

---

## Taskmaster API

### @opencode/taskmaster

#### Installation

```bash
bun add @opencode/taskmaster
```

#### Initialization

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

---

### Core Methods

#### Project Management

**createProject**:

```typescript
async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>
```

Example:

```typescript
const project = await taskmaster.createProject({
  name: "AI Chat Application",
  description: "Modern chat with AI",
  status: "active",
  team_members: ["alice", "bob"],
})
```

**getProjectMetrics**:

```typescript
async getProjectMetrics(projectId: string): Promise<ProjectMetrics>
```

Returns:

```typescript
interface ProjectMetrics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  averageTaskDuration: number
  estimatedCompletionDate?: string
}
```

---

#### Task Management

**createTask**:

```typescript
async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task>
```

Example:

```typescript
const task = await taskmaster.createTask({
  title: "Implement AI Chat",
  description: "Build React component",
  priority: "high",
  project_id: project.id,
  estimated_hours: 8,
  tags: ["frontend", "ai", "react"],
})
```

**updateTaskProgress**:

```typescript
async updateTaskProgress(
  taskId: string,
  progress: number,
  notes?: string,
  recordedBy?: string
): Promise<boolean>
```

Example:

```typescript
await taskmaster.updateTaskProgress(task.id, 75, "Component structure complete", "developer-1")
```

---

#### Workflow Execution

**executeWorkflow**:

```typescript
async executeWorkflow(workflowId: string, context?: Record<string, any>): Promise<WorkflowExecution>
```

Example:

```typescript
const execution = await taskmaster.executeWorkflow("workflow-123", {
  environment: "production",
  timeout: 30000,
})
```

---

## Type Definitions

### Common Types

```typescript
// AI Message
interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

// AI Response
interface AIResponse {
  content: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

// Task
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
  created_at: string
  updated_at: string
}

// Project
interface Project {
  id: string
  name: string
  description?: string
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  team_members: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// Agent
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

---

## Configuration

### OpenRouter SDK Configuration

```typescript
await initializeOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: "openai/gpt-4o-mini",
  timeout: 30000,
  maxRetries: 3,
})
```

### Taskmaster Configuration

```typescript
const taskmaster = createTaskmaster({
  dbPath: "./data/taskmaster.db",
  enableAutoAssignment: true,
  enableProgressTracking: true,
  enableDependencyManagement: true,
  maxConcurrentTasks: 5,
})
```

---

## Best Practices

### 1. Error Handling

Always handle errors from async operations:

```typescript
const { generate, error } = useAI()

const handleGenerate = async () => {
  try {
    const result = await generate("Your prompt")
    if (!result) {
      console.error("Generation failed:", error)
      return
    }
    // Use result
  } catch (err) {
    console.error("Unexpected error:", err)
  }
}
```

### 2. Loading States

Show loading indicators during AI operations:

```typescript
const { isLoading } = useAI()

return (
  <Button disabled={isLoading}>
    {isLoading ? 'Generating...' : 'Generate'}
  </Button>
)
```

### 3. Caching Strategy

Use caching for repeated queries:

```typescript
const cache = useCache()
const key = cache.generateKey(messages, model, options)

let response = cache.get(key)
if (!response) {
  response = await generate(messages)
  cache.set(key, response.content, model)
}
```

### 4. Workflow Organization

Structure workflows with clear dependencies:

```typescript
const agents = [
  { id: 'analyzer', name: 'Code Analyzer', role: 'analysis', ... },
  { id: 'reviewer', name: 'Code Reviewer', role: 'review', dependencies: ['analyzer'], ... }
]
```

### 5. Progress Tracking

Track progress for long-running operations:

```typescript
await taskmaster.updateTaskProgress(taskId, 50, "Halfway through implementation")
```

---

## Migration Guide

### From v1.0 to v2.0

No breaking changes - all v1.0 features work unchanged.

**New features to adopt**:

1. **Multi-Agent Workflows**:

```typescript
// Old: Single AI call
const response = await generate(prompt)

// New: Multi-agent workflow
const workflow = useWorkflow()
const result = await workflow.executeWorkflow(workflowId)
```

2. **Analytics Tracking**:

```typescript
// New: Track usage
const analytics = useAnalytics()
console.log(`Total cost: $${analytics.metrics.totalCost}`)
```

3. **Smart Caching**:

```typescript
// New: Enable caching
const cache = useCache()
const cached = cache.get(key)
```

---

**Last Updated**: 2024
**Version**: 2.0
